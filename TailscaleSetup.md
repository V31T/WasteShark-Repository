# Tailscale & Keygen Set-up
NOTE: these instructions are for a MacOS machine. If you are on Windows I recommend using WSL (Windows Subsystem for Linux) to do the following. If you have any questions please contact me, Henry Pham, and I will help with set-up.

## intstall tailscale 

link to tailscale download/ follow their documentation
[tailscale download](https://tailscale.com/download)

login and have tailscale open on a browser

## Keygen with RSA 
### (should be ed22519 [sorry mr huh])

open a terminal/powershell WSL window to do the following commands.

first cd into your .ssh folder, its kinda standard practice to hold all the keys that are used for ssh in its own designated folder
```bash
cd ~/.ssh
```

NOTE: `~` specifies your home directory

for fun lets check if you have keys in your .ssh folder
```bash
ls .
```

Review: what command would you use to list the contents of .ssh when your current directory is not currently `.ssh`

use the following command to create your public-private key pair.
```bash
ssh-keygen -t rsa "<name> <personal_email_used_for tailscale>"
```

You will prompted to name your key. you can name it whatever you want but for the REST OF THIS DOCUMENT I WILL ASSUME YOUR KEYNAME IS `tailscale_rsa`.

next you will be prompted to put in a password for your key, i never personally have ever put a password so you can just press `enter` twice to make it have no password. (if you are an active, aka michael huh, reading this and are mad im sorry)

NOTE: [What is a public-private key pair?](https://www.preveil.com/blog/public-and-private-key/)

What did we just do? 
We just generated a public-private key pair using rsa encryption. in the most simple terms possible, the public key can be handed out to anyone so they ENCRYPT the message, but only our private-key can ever decrypt that message. 

now that your public-private pair key is created and placed in your .ssh folder we need to now send your public key to rishabh.

you can either just directly send your public key 


what a public vs private key is what rsa is, why send your public key to rishabh and not your private key

## connecting to Rishabh's Server using tailscale

after sending your public key to rishabh will be able to share his environment with you via tailscale

rishabh's invite will be to whatever non-school email you gave him. it will contain the link/button to add his machine to your tailscale account.

### ssh-ing to his server

use tailscale to find the ipv4 address that you can ssh into

#### How to find IPv4 address
On Tailscale web browswer, click on `theta-tau-project-<user>` to access details about the machine

scroll down to `Machine Details` and there should be an `Ipv4 Address` that you can copy/use to ssh into

run the following command in your terminal:
```bash
ssh -i ~/.ssh/<key_name> user@<ip_address_from_tailscale>
```

NOTE: for review, what does `~/.ssh` do, and what does `user@` do?

Assuming you did the above correct, you will be prompted to input the password for your user. Please DM Rishabh or Henry Pham for the password.


chat this does not work

