# HAWN Static Interface

A lightweight static front-end prototype for the HAWN workflow, built with plain HTML, CSS, JavaScript, and JSON.

This version focuses on UI flow and first-aid recommendation rendering while the detection backend (YOLO/API) is still under integration.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Team](#team)
- [Supervision](#supervision)

## Overview

The interface simulates an end-to-end analysis experience:

- Upload/select image input
- Display analysis outcome
- Show first-aid recommendations from a local JSON knowledge source

Current analysis output is mocked in the frontend to enable UI testing before backend connectivity is finalized.

## Key Features

- Clean, dependency-light static interface
- Fast local run with Live Server
- JSON-driven first-aid guidance content
- Backend-ready structure for future API/YOLO integration

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- JSON for recommendation data

## Project Structure

```text
.
|-- index.html
|-- script.js
|-- style.css
`-- first-aid-guidance.json
```
## Quick Start
1. Open the project folder in VS Code.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

## How It Works
1. The UI triggers an analysis flow from `script.js`.
2. The current detection result is mocked for frontend validation.
3. First-aid recommendations are retrieved from `first-aid-guidance.json`.
4. Results and guidance are rendered in the interface.

## Supervision

- **Project Supervisor:** Dr. Areej Alsini
  
## Team

- **Team Leader:** [Fouz Alsharif]
- **Team Members:**
  - [Lama Aloufi]
  - [Maria Alamri]
  - [Judy Alomiri]
  
