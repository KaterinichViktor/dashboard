document.addEventListener('DOMContentLoaded', () => {
    const widgets = document.querySelectorAll('.widget');
    const container = document.querySelector('.small-widget-box');
    const gridSize = 20; // Define the grid size

    widgets.forEach(widget => {
        const resizer = widget.querySelector('.resizer');

        // Load saved sizes from local storage
        const savedSize = localStorage.getItem(`widget-${widget.dataset.id}-size`);
        if (savedSize) {
            const size = JSON.parse(savedSize);
            widget.style.width = size.width;
            widget.style.height = size.height;
        }

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = parseInt(document.defaultView.getComputedStyle(widget).width, 10);
            const startHeight = parseInt(document.defaultView.getComputedStyle(widget).height, 10);

            function resize(event) {
                const rect = container.getBoundingClientRect();
                const maxWidth = rect.width - widget.offsetLeft - 20; // Adjust for margin/padding

                let newWidth = startWidth + event.clientX - startX;
                let newHeight = startHeight + event.clientY - startY;

                // Snap to grid
                newWidth = Math.round(newWidth / gridSize) * gridSize;
                newHeight = Math.round(newHeight / gridSize) * gridSize;

                // Prevent overflow
                newWidth = Math.min(newWidth, maxWidth);

                // Update the size of the current widget
                widget.style.width = newWidth + 'px';
                widget.style.height = newHeight + 'px';

                // Adjust neighboring widgets
                adjustNeighboringWidgets(widget, newWidth, newHeight);
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);

                // Save the new size to local storage
                const size = {
                    width: widget.style.width,
                    height: widget.style.height
                };
                localStorage.setItem(`widget-${widget.dataset.id}-size`, JSON.stringify(size));
            }

            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        });
    });

    function adjustNeighboringWidgets(widget, newWidth, newHeight) {
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach(w => {
            if (w !== widget) {
                const rect = w.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rect.top === widget.getBoundingClientRect().top) {
                    // Adjust width of widgets in the same row
                    w.style.width = (containerRect.width - newWidth - 20) + 'px'; // Adjust for margin/padding
                }
                if (rect.left === widget.getBoundingClientRect().left) {
                    // Adjust height of widgets in the same column
                    w.style.height = (containerRect.height - newHeight - 20) + 'px'; // Adjust for margin/padding
                }
            }
        });
    }

    // Ensure body resizes to fit content
    const observer = new MutationObserver(() => {
        document.body.style.height = container.scrollHeight + 'px';
    });

    observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true
    });
});
