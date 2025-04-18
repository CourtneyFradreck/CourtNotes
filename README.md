# CourtNotes

Welcome to my personal blogging website! Here, I share my thoughts, ideas, and experiences on a variety of topics. This site is built with [Eleventy (11ty)](https://www.11ty.dev/) and serves as a space for me to write and experiment with web development. The project serves as a learning exercise while I explore 11ty's features and functionalities, with the goal of later implementing it in my portfolio.

## 🚀 Features

- 📝 Static site generation with **Eleventy**
- 📄 Templating with **Nunjucks**
- 🗂️ **Netlify CMS** for easy content management
- 🎨 Minimal and responsive design
- ⚡ Fast and optimized for performance

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/courtneyfradreck/courtnotes.git
   cd courtnotes
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Development Server

To start the development server, run:

```sh
npm run dev
```

This will launch the app at `http://localhost:8080/`.

### Building for Production

To generate a production-ready build, run:

```sh
npm run build
```

The output will be in the `public` directory.

## Folder Structure

```
courtnotes/
├── src/
│   ├── admin/         # Netlify CMS configuration and admin files
│   ├── _includes/     # Nunjucks reusable templates and partials
│   ├── notes/         # Your personal Markdown blog posts
│   ├── styles/        # CSS stylesheets
│   ├── assets/        # Images and static assets
│   ├── index.njk      # Homepage template
│   └── ...            # Other source files
├── .eleventy.js       # Eleventy configuration file
├── package.json       # Project metadata and scripts
├── package-lock.json  # Dependency lock file
├── README.md          # Project documentation (this file)
└── ...                # Additional config or root files
```

## Customization

- Modify `_data/` for global site data.
- Update `_includes/` to change the UI components.
- Add new Markdown files in `notes/` to create new notes.
- Customize styles in `styles/` to match your preferred design.

## Roadmap

- Implement search functionality
- Add tagging and categorization for notes
- Support for dark mode
- Improve accessibility and performance

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Eleventy](https://www.11ty.dev/) for the static site generator
- Open-source community for inspiration and guidance

## Author

[Courtney Fradreck](https://courtney.codes)
