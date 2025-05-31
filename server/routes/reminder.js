import express from 'express';
import { google } from 'googleapis';
import moment from 'moment-timezone';
import User from '../models/user.js';
import { checkAuth } from '../middleware/auth.js';
import config from '../config/config.js';

const router = express.Router();

// Debug environment variables
console.log('=== GOOGLE OAUTH DEBUG ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'MISSING');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'MISSING');
console.log('========================');

// Initialize Google OAuth2 client with validation
// Replace the OAuth client initialization with:
const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  console.error('❌ Missing Google OAuth environment variables. Please check your .env file.');
  console.error('Required variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI');
  console.error('Current values:');
  console.error('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'undefined');
  console.error('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'defined' : 'undefined');
  console.error('- GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'undefined');
}

// Google OAuth routes
router.get('/auth/google', (req, res) => {
  try {
    // Check if required environment variables are present
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is missing from environment variables');
      return res.status(500).send('Google OAuth configuration error. Please contact administrator.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly', // read access
      'https://www.googleapis.com/auth/calendar.events'     // create/update access
    ];

    const url = oauth2Client.generateAuthUrl({ 
      access_type: 'offline', 
      scope: scopes,
      prompt: 'consent' // Force consent screen to get refresh token
    });
    
    console.log('Generated OAuth URL:', url);
    res.redirect(url);
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).send('Failed to initiate Google OAuth');
  }
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No authorization code');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).send('User not logged in');
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token;
    await user.save();

    res.redirect('https://healthops-phds-5blg.vercel.app/reminders');
  } catch (error) {
    console.error('OAuth2 error:', error);
    res.status(500).send('OAuth2 callback error');
  }
});

// Get reminders and Google Calendar data
router.get('/reminders/data', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found');

    let googleCalendarEvents = [];
    let googleCalendarConnected = false;

    if (user.googleAccessToken) {
      googleCalendarConnected = true;

      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
      });

      try {
        // Refresh the access token if expired
        const { token } = await oauth2Client.getAccessToken();
        oauth2Client.setCredentials({ access_token: token });

        // Optionally save refreshed token to DB
        if (token !== user.googleAccessToken) {
          user.googleAccessToken = token;
          await user.save();
        }

        const response = await google.calendar({ version: 'v3', auth: oauth2Client }).events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          timeMax: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 10
        });

        googleCalendarEvents = response.data.items || [];
        console.log('Fetched Google Calendar events:', googleCalendarEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error.message);
        // Reset connection status if there's an authentication error
        if (error.code === 401 || error.code === 403) {
          googleCalendarConnected = false;
        }
      }
    }

    res.json({
      reminders: user.reminders || [],
      googleCalendarEvents,
      googleCalendarConnected
    });
  } catch (error) {
    console.error('Error fetching reminders data:', error);
    res.status(500).send('Server error');
  }
});

// Add a new reminder
router.post('/reminders/add', checkAuth, async (req, res) => {
  try {
    const { text, time, syncToCalendar, userTimeZone } = req.body;
    
    if (!text || !time) {
      return res.status(400).json({ message: 'Text and time are required' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found');

    const [hour, minute] = time.split(':');
    const now = moment().tz(userTimeZone || 'UTC');
    const startDateTime = moment(now).set({ hour: parseInt(hour), minute: parseInt(minute), second: 0 });
    const endDateTime = moment(startDateTime).add(30, 'minutes');

    const reminder = {
      text,
      time,
      completed: false,
      calendarEventId: null
    };

    // Sync to Google Calendar if requested and user has connected their account
    if (syncToCalendar && user.googleAccessToken) {
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
      });

      try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
          summary: text,
          start: { 
            dateTime: startDateTime.toISOString(), 
            timeZone: userTimeZone || 'UTC'
          },
          end: { 
            dateTime: endDateTime.toISOString(), 
            timeZone: userTimeZone || 'UTC'
          }
        };

        const googleEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        reminder.calendarEventId = googleEvent.data.id;
        console.log('Successfully synced reminder to Google Calendar');
      } catch (err) {
        console.error('Error syncing to Google Calendar:', err.message);
        // Continue saving the reminder even if calendar sync fails
      }
    }

    user.reminders.push(reminder);
    await user.save();
    
    res.status(201).json({ message: 'Reminder added successfully', reminder });
  } catch (error) {
    console.error('Error adding reminder:', error);
    res.status(500).send('Server error');
  }
});

// Mark reminder as completed
router.post('/reminders/complete/:id', checkAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const reminderId = req.params.id;

    const result = await User.updateOne(
      { _id: userId, 'reminders._id': reminderId },
      { $set: { 'reminders.$.completed': true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Reminder not found');
    }

    res.status(200).json({ message: 'Reminder completed successfully' });
  } catch (error) {
    console.error('Error completing reminder:', error);
    res.status(500).send('Server error');
  }
});

// Delete a reminder
router.post('/reminders/delete', checkAuth, async (req, res) => {
  try {
    const { reminderId } = req.body;
    
    if (!reminderId) {
      return res.status(400).json({ message: 'Reminder ID is required' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found');

    const reminder = user.reminders.id(reminderId);
    if (!reminder) return res.status(404).send('Reminder not found');

    // Delete from Google Calendar if it was synced
    if (reminder.calendarEventId && user.googleAccessToken) {
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
      });

      try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: reminder.calendarEventId
        });
        console.log('Successfully deleted event from Google Calendar');
      } catch (err) {
        console.error('Error deleting Google Calendar event:', err.message);
        // Continue with reminder deletion even if calendar deletion fails
      }
    }

    user.reminders.pull(reminderId);
    await user.save();

    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).send('Server error');
  }
});

// Get Google Calendar events (separate endpoint)
router.get('/google-calendar-events', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.googleAccessToken) {
      return res.status(403).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    try {
      const response = await google.calendar({ version: 'v3', auth: oauth2Client }).events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50
      });

      res.json(response.data.items || []);
    } catch (error) {
      console.error('Google event fetch error:', error.message);
      res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
  } catch (error) {
    console.error('Error in google-calendar-events route:', error);
    res.status(500).send('Server error');
  }
});

// Disconnect Google Calendar
router.post('/reminders/disconnect-google', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found');

    // Revoke the token with Google
    if (user.googleAccessToken) {
      try {
        await oauth2Client.revokeToken(user.googleAccessToken);
      } catch (error) {
        console.error('Error revoking Google token:', error.message);
      }
    }

    // Clear tokens from database
    user.googleAccessToken = null;
    user.googleRefreshToken = null;
    await user.save();

    res.status(200).json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).send('Server error');
  }
});

// Update reminder
router.put('/reminders/:id', checkAuth, async (req, res) => {
  try {
    const { text, time, syncToCalendar, userTimeZone } = req.body;
    const reminderId = req.params.id;
    const userId = req.session.userId;

    if (!text || !time) {
      return res.status(400).json({ message: 'Text and time are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    const reminder = user.reminders.id(reminderId);
    if (!reminder) return res.status(404).send('Reminder not found');

    // Update reminder fields
    reminder.text = text;
    reminder.time = time;

    // Handle Google Calendar sync for updated reminder
    if (syncToCalendar && user.googleAccessToken) {
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
      });

      try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const [hour, minute] = time.split(':');
        const now = moment().tz(userTimeZone || 'UTC');
        const startDateTime = moment(now).set({ hour: parseInt(hour), minute: parseInt(minute), second: 0 });
        const endDateTime = moment(startDateTime).add(30, 'minutes');

        const event = {
          summary: text,
          start: { 
            dateTime: startDateTime.toISOString(), 
            timeZone: userTimeZone || 'UTC'
          },
          end: { 
            dateTime: endDateTime.toISOString(), 
            timeZone: userTimeZone || 'UTC'
          }
        };

        if (reminder.calendarEventId) {
          // Update existing calendar event
          await calendar.events.update({
            calendarId: 'primary',
            eventId: reminder.calendarEventId,
            resource: event
          });
        } else {
          // Create new calendar event
          const googleEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: event
          });
          reminder.calendarEventId = googleEvent.data.id;
        }
      } catch (err) {
        console.error('Error updating Google Calendar event:', err.message);
      }
    }

    await user.save();
    res.status(200).json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).send('Server error');
  }
});

export default router;