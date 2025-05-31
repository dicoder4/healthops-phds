// Toggle sidebar visibility
document.getElementById('profile-icon').addEventListener('click', function() {
    document.getElementById('profile-sidebar').classList.toggle('active');
});

// Close sidebar
document.getElementById('close-sidebar').addEventListener('click', function() {
    document.getElementById('profile-sidebar').classList.remove('active');
});

// Logout functionality
function logout() {
    window.location.href = '/logout'; // Redirect to the logout endpoint
}

// Handle form submission for profile updates
// Handle form submission for profile updates
document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    const gmail = document.getElementById('gmail').value;
    const phNo = document.getElementById('phNo').value;

    // Send the updated profile data to the server
    fetch(`${process.env.REACT_APP_BACKEND_URL}/update-profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            gmail: gmail,
            phNo: phNo,
        }),
    })
        .then(response => response.json())
        .then(data => {
            const alertDiv = document.getElementById('custom-alert');
            const alertMessage = document.getElementById('alert-message');

            if (data.success) {
                alertMessage.textContent = 'Profile updated successfully!';
                alertDiv.classList.remove('error');
                alertDiv.style.display = 'block'; // Show success alert
            } else {
                alertMessage.textContent = 'Error updating profile!';
                alertDiv.classList.add('error');
                alertDiv.style.display = 'block'; // Show error alert
            }
                setTimeout(() => {
                    alertDiv.style.display = 'none'; // Hide the alert after fade-out completes
                    alertDiv.style.opacity = '1'; // Reset opacity for next time
                },3000); // Wait for the transition duration (1s)
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function closeAlert() {
    document.getElementById('custom-alert').style.display = 'none'; // Hide the alert
}


document.addEventListener('DOMContentLoaded', () => {
    // Trigger animations in sequence
    const welcomeText = document.querySelector('.welcome-text');
    const typingText = document.querySelector('.typing-text');
    const growText = document.querySelector('.grow-text');

        // Timing to remove the cursor (match typing animation duration)
        const typingDuration = 2.5 * 1000; // Typing duration in milliseconds
        const typingDelay = 1.2 * 1000;    // Animation delay before typing starts

    setTimeout(() => {
        welcomeText.style.animationPlayState = 'running'; // Start slide down
    }, 500);

    setTimeout(() => {
        typingText.classList.add('no-cursor');
    }, typingDuration + typingDelay); // Total delay: typing time + animation delay

    setTimeout(() => {
        growText.style.animationPlayState = 'running'; // Start growing
    }, 4000);
});


