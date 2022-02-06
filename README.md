# p2p-deploy

    _____ ___  _____        _____  ______ _____  _      ______     __
 |  __ \__ \|  __ \      |  __ \|  ____|  __ \| |    / __ \ \   / /
 | |__) | ) | |__) |_____| |  | | |__  | |__) | |   | |  | \ \_/ / 
 |  ___/ / /|  ___/______| |  | |  __| |  ___/| |   | |  | |\   /  
 | |    / /_| |          | |__| | |____| |    | |___| |__| | | |   
 |_|   |____|_|          |_____/|______|_|    |______\____/  |_|   

 Node service running on the remote machine helps you to run ci/cd command from your local machine.  

(Beta phase, Tested working)

# Install (recomanded)
npm i -g p2p-deploy

# dependency
1) pm2: For continuous running the service, you can use nohup or create a service file too.

# How to Use

Step 1: Install the application on the remote machine

Step 2: Generate a acceess key. Run 'sudo p2p-deploy keygen' , note the key required in step 5 

Step 3: Run 'p2p-deploy start' it will start the service on port 7861, you need to open that port
 
Step 3.1: (Optional) run 'curl http://severip:port' that will give connection error if someting went wrong
 else will say 'Hello from p2p deploy service!'

Step 4: Install it in your local machine, recommended to install as global dependency

Step 5: Run 'p2p-deploy setup' on local machine (on the repro path) that will ask you a access key and generate 'p2pd.config.js' file. Modify its content as you need.(like change server IP, and port, commands, base directory)

Step 6: Run 'p2p-deploy deploy' to deploy the updateds.

Step 7: Run 'p2p-deploy help' to know more commands.

# Prerequisite 
1) Clone the repro in the base path file on server first time
2) Keep logged in in git (so that its didn't ask for password when run git pull)
3) Install pm2 on your system

