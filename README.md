# Vibrant as a Function

This repository contains code to run an abstraction of [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant) over Google Cloud Functions.  
This enables any service to extract prominent colors from an image.

There is a single function that is invoked through a HTTP call, which expects a URL to an image in the body and returns the full palette
of [Swatches](https://github.com/Vibrant-Colors/node-vibrant#vibrantswatch).

## Usage

The invocation of the hosted function will look similar to this:

```bash
curl -X GET <url> -d '{"url": "https://picsum.photos/id/85/640/387"}'
```

The response will look like this:

```json
[
  {
    "key": "Vibrant",
    "hex": "#ec8537",
    "population": 621
  },
  {
    "key": "DarkVibrant",
    "hex": "#b14924",
    "population": 3
  },
  {
    "key": "LightVibrant",
    "hex": "#fcd857",
    "population": 21
  },
  {
    "key": "Muted",
    "hex": "#aa744c",
    "population": 41
  },
  {
    "key": "DarkMuted",
    "hex": "#6e4335",
    "population": 1051
  },
  {
    "key": "LightMuted",
    "hex": "#bb9466",
    "population": 103
  }
]
```

## Setup locally

In case you wish to make changes to the function, you can run it on your local machine.

#### Install npm packages

```bash
npm install
```

#### Run the app

```bash
npm run start
```

## Manual deployment

A prerequisite is that a GCP project must exist and that Cloud Functions must be enabled for that project.

#### Preparation

```bash
gcloud auth login
```

```bash
gcloud config set project PROJECTNAME
```

#### Deployment

```bash
gcloud functions deploy NAME --region REGION --entry-point vibrant --allow-unauthenticated --trigger-http --runtime nodejs16
```

> The deployment has not been tested.
