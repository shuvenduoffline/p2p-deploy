
```
d8888b. .d888b. d8888b.        d8888b. d88888b d8888b. db       .d88b.  db    db 
88  `8D VP  `8D 88  `8D        88  `8D 88'     88  `8D 88      .8P  Y8. `8b  d8' 
88oodD'    odD' 88oodD'        88   88 88ooooo 88oodD' 88      88    88  `8bd8'  
88~~~    .88'   88~~~   C8888D 88   88 88~~~~~ 88~~~   88      88    88    88    
88      j88.    88             88  .8D 88.     88      88booo. `8b  d8'    88    
88      888888D 88             Y8888D' Y88888P 88      Y88888P  `Y88P'     YP    
```                                                                          

 Node service running on the remote machine helps you to run ci/cd command from your local machine.  

(Beta phase, Tested working)

# Install (recomanded)
npm i -g p2p-deploy

# dependency
1) pm2: For continuous running the service, you can use nohup or create a service file too.

# How to Use

Step 1: Install the application on the remote machine

Step 2: Generate an access key. Run 'sudo p2p-deploy keygen' , note the key required in step 5 

Step 3: Run 'p2p-deploy start' it will start the service on port 7861, you need to open that port
 
Step 3.1: (Optional) run 'curl http://severip:port' that will give a connection error if something went wrong
 else will say 'Hello from p2p deploy service!'

Step 4: Install it in your local machine, recommended installing as global dependency

Step 5: Run 'p2p-deploy setup' on local machine (on the repro path) that will ask you an access key and generate 'p2pd.config.js' file. Modify its content as you need.(like change server IP, and port, commands, base directory)

Step 6: Run 'p2p-deploy deploy' to deploy the updates.

Step 7: Run 'p2p-deploy help' to know more commands.

# Prerequisite 
1) Clone the repro in the base path file on the server first time
2) Keep logged in in git (so that it didn't ask for a password when running git pull)
3) Install pm2 on your system

**Note**

Don't make your access key public as that is used to generate secure encrypted message that decoded my server to run
Add the '*.key' file in your gitigore


