# Installing Docker Desktop for Windows

## Step 1: Download Docker Desktop

1. Go to: https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Download the installer (Docker Desktop Installer.exe)

## Step 2: Install Docker Desktop

1. Run the installer you downloaded
2. Follow the installation wizard
3. **Important**: Make sure "Use WSL 2 instead of Hyper-V" is checked (recommended for Windows 10/11)
4. Click "Ok" when installation completes

## Step 3: Restart Your Computer

Docker Desktop requires a restart to complete installation.

## Step 4: Start Docker Desktop

1. After restart, find Docker Desktop in your Start menu
2. Launch Docker Desktop
3. Wait for it to start (you'll see a whale icon in your system tray)
4. Accept the terms of service if prompted

## Step 5: Verify Installation

Open PowerShell and run:

```powershell
docker --version
docker-compose --version
```

You should see version numbers for both commands.

## Troubleshooting

### Docker Desktop won't start

- Make sure Windows Subsystem for Linux (WSL 2) is installed and updated
- Check that virtualization is enabled in your BIOS
- Try running Docker Desktop as Administrator

### Enable WSL 2 (if needed)

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

Then restart your computer.

### Check if virtualization is enabled

1. Open Task Manager (Ctrl + Shift + Esc)
2. Go to the "Performance" tab
3. Click "CPU"
4. Look for "Virtualization: Enabled" at the bottom

If it says "Disabled", you need to enable it in your BIOS settings.

## After Installation

Once Docker is installed, you can use:

```powershell
# Build the Docker image
npm run docker:build

# Start with Docker Compose
npm run docker:up

# Or use the helper script
.\docker-start.ps1
```

