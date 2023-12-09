const timeAgo = (dateString) => {
    const now = new Date(); // Current time
    const then = new Date(dateString); // Converts ISO string to Date object

    const seconds = Math.round((now - then) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        const formattedHours = then.getHours().toString().padStart(2, '0'); // Ensure two-digit hours
        const formattedMinutes = then.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
        return `${formattedHours}:${formattedMinutes}`;
    } else {
        // Format for dates more than a day old
        const formattedHours = then.getHours().toString().padStart(2, '0'); // Ensure two-digit hours
        const formattedMinutes = then.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
        return `${then.toLocaleString('default', { month: 'long' })} ${then.getDate()}, ${then.getFullYear()} at ${formattedHours}:${formattedMinutes}`;
    }
};

export{timeAgo}