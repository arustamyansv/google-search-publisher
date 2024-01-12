Script to index site endpoints 
===============

## Installation (Windows)

Installation steps:
1. Run Terminal
2. Install Nodejs
3. Reload Terminal
4. Change Directory to the Project Folder
5. Install Node Packages

##### Run Terminal

1. `❖ + R`
2. type `cmd`
3. press `enter`

##### Install Nodejs

`winget install -e --id OpenJS.NodeJS -v 19.8.1`

##### Reload Terminal

Close terminal and repeat *Run Terminal* step.

##### Change Directory to the Project Folder

Use `cd <path_to_project>` if project at the same drive.
Type drive directly if drive is different.

##### Install Node Packages

`npm install --save-dev`


## Description

Script takes list of urls from files and send publish requests to google search to try to force indexing.
It can process multiple projects at the same time.

For this script to work you will need both - access to google search console and google cloud console.

Basic requirement for script is to have
1. Service account registered in google cloud console
2. List of URLs loaded from google search console


### Google Cloud Console

Here you need to create service account that has an access to Web Search Indexing API.
This user will be utilised by script to send requests.
Load credentials file for this service account, it's one of 2 mandatory files.

### Google Search Console

Create user that will have same name as service account in Google Cloud Console.

It works by using Web Search Indexing API provided by google cloud console.
API requests are further batched in groups of 100 via google batch api.

### Supply script with files

There is data directory inside the script folder
All files related to projects must be placed there

Directory has folowing structure

```
data\                       # data directory in the project folder
    <project_name>\         # project directory you should create for each project
        sa.json             # service account credentials file
        urls.csv            # list of urls for processing
        urls_processed.csv  # list of processed urls. Created and managed by script itself.
```
