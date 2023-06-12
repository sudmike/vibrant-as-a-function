# Preview as a Function

This repository contains two Google Cloud Functions.

## Function Vibrant

This function provides an abstraction of [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant).
This enables any service to extract prominent colors from an image.

### Usage

This function expects a URL to an image in the body and returns the full palette
of [Swatches](https://github.com/Vibrant-Colors/node-vibrant#vibrantswatch).

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

## Function preload

This function provides a way to get a lower resolution, blurred image that can be loaded as a placeholder.

### Usage

This function expects a URL to an image in the body and returns a smaller blurred version of the image.

The invocation of the hosted function will look similar to this:

```bash
curl -X GET <url> -d '{"url": "https://picsum.photos/id/85/640/387"}'
```

The response will be a lower resolution version of that image.

## Setup locally

In case you wish to make changes to the functions, you can run them on your local machine.

#### Install npm packages

```bash
npm install
```

#### Run the functions

```bash
npm run start:vibrant
```

```bash
npm run start:preload
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
gcloud functions deploy NAME --entry-point vibrant --region REGION --allow-unauthenticated --trigger-http --runtime nodejs16
```

```bash
gcloud functions deploy NAME --entry-point preload --region REGION --allow-unauthenticated --trigger-http --runtime nodejs16
```
