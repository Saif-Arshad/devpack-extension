document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const header = document.getElementById('header');
    const toggleThemeBtn = document.getElementById('toggleThemeBtn');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    // Load theme from storage
    chrome.storage.local.get('theme', (result) => {
        const savedTheme = result.theme || 'dark'; // Default to dark theme
        body.classList.add(savedTheme);
        header.classList.toggle('light', savedTheme === 'light');
        sunIcon.style.display = savedTheme === 'light' ? 'block' : 'none';
        moonIcon.style.display = savedTheme === 'light' ? 'none' : 'block';
    });

    // Toggle theme on button click
    toggleThemeBtn.addEventListener('click', () => {
        const isDark = body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        body.classList.toggle('dark', !isDark);
        body.classList.toggle('light', isDark);
        header.classList.toggle('light', isDark);

        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';

        // Save the new theme to storage
        chrome.storage.local.set({ theme: newTheme });
    });
});
