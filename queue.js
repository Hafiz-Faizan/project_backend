// queue.js

const queue = [];

const addTaskToQueue = (task) => {
    queue.push(task);
};

const processQueue = async () => {
    while (true) {
        if (queue.length > 0) {
            const task = queue.shift();
            try {
                // Ensure task is a function and execute it
                if (typeof task === 'function') {
                    await task(); // Execute the task
                } else {
                    console.error(`Invalid task format: ${typeof task}`);
                }
            } catch (error) {
                console.error(`Error executing task: ${error.message}`);
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking the queue again
        }
    }
};

module.exports = { addTaskToQueue, processQueue, queue };
