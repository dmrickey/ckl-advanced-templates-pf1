From `ghost` here: https://discord.com/channels/732325252788387980/754127569246355477/1143987690883260468
I use this:
```json
{
    "type": "chrome",
    "request": "launch",
    "runtimeExecutable": "/usr/bin/chromium",
    "name": "Launch Chrome against localhost",
    "url": "http://localhost:30000/game",
    "pathMapping": {
        "/systems/ds4": "${workspaceFolder}/dist"
    }
}
```

> You'll need to adjust it so that the runtimeExecutable works on your system (if you have regular chrome installed, it might just work without setting it at all). You'll also need to adjust the pathMapping so that it points the URL foundry uses to load your system to the folder where the system actually lies. In my case, that's inside the dist folder in my project
