# Contribution Guidelines

We appreciate your enthusiasm for enhancing DevPack! Whether you're submitting fresh resources or refining the extension, your input is greatly valued.

## How to Contribute New Resources

You can add new resources to DevPack by:
- [Submitting a pull request](#submitting-a-pull-request)

**Before proposing a resource, please ensure that:**

- The resource is not already included in our database.
- There is an appropriate category available for the resource. If none exists, you can add one by modifying the category array in [popup.js](https://github.com/Saif-Arshad/devpack-extension/blob/main/popup.js).
- The resource meets the [defined structure](#resource-structure).

## Submitting a Pull Request

Follow these steps to submit your pull request:

1. **Fork the Repository:**  
   Begin by forking the repository on GitHub.

2. **Clone Your Fork:**  
   Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/your-username/devpack-extension
   ```
3. **Navigate to the Repository Directory:**  
   ```bash
   cd devpack-extension
   ```
4. **Create a New Branch (Optional):**  
   ```bash
   git checkout -b your-feature-branch
   ```
5. **Implement Your Changes:**
   Update the extension or add your resources to the relevant JSON files located in Resources/filename.
6. **Stage Your Changes**
   ```bash
   git add .```
7. **Commit Your Changes:**
   ```bash
   git commit -m "✨ Add new resources"
   ```
8. **Push Your Branch:**
   ```bash
   git push origin your-feature-branch
   ```
9. **Push Your Branch:**
   ```bash
   git push origin your-feature-branch
   ```
10. **Open a Pull Request:**
Finally, open a pull request for your changes to be reviewed and merged.

## Resource Structure

When adding a new resource, please follow this structure:

- **id** (number; optional)  
  It's recommended to append new resources at the end and maintain sequential ordering with previous IDs.  
- **name** (string; required)  
  The name of the resource.  
- **link** (string; required)  
  The URL of the resource.  
- **tags** (array of strings)  
  Keywords that describe the resource, for example: *IA*, *React*, *Library*, *Loaders*, etc.

### Example JSON entry

```json
{
  "id": 23,
  "name": "Resource Name",
  "link": "https://resource.com",
  "tags": ["IA", "React", "Library", "3D"]
}

   
   
