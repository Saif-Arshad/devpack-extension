document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testBtn');
    if (testButton) {
        testButton.addEventListener('click', () => {
            alert('Button clicked!');
        });
    }
});
