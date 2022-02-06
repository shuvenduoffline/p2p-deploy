# p2p-deploy
(Alpha phase, I'm using and improving it)

Node service running on the remote machine helps you to run ci/cd command from your local machine.


# dependency
1) pm2: For continuous running the service, you can use nohup or create a service file too.

# How to Use

Step 1: Install the application on the remote machine

Step 2: Run 'p2p-deploy start' or 'node . start' if you cloned it, it will generate an access key and start the service on port 7861, you need to open that port
 (if you got file permission error please run the command with sudo)

Step 3: Install it in your local machine, recommended to install as a dev dependency

Step 4: Run 'p2p-deploy setup' on local machine that will ask you a access key and generate 'p2pd.config.js' file. Modify its content as you need.(like change server IP, and port, commands, base directory)

Step 5: Run 'p2p-deploy deploy' to run the script on remote machine.

Step 6: Run 'p2p-deploy help' or 'node . help' if you cloned it to know more commands.
