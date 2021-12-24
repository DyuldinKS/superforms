<div id="top"></div>

**The project is no longer maintained. Sorry.**

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

The goal of this project is to automate the manual labor of valuable data collection for over 100 workers in the district education system.

The web application provide set of tools to create/manipulate/distribute questionnaires of any kind as well as collect/view/export answers.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [React.js](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Webpack](https://webpack.js.org/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- node: `~9.11.2`
- npm: `~5.6.0`
- postgresql: `~10.14`

You may want to use [nvm](https://github.com/nvm-sh/nvm) package to use old node version.

#### \* Apple M-series chips troubleshooting

If you are using MacBook with M-series chip you may have a hard time installing `node v8`.
Below are the links that might help you to overcome issues:

- [xcode issues](https://apple.stackexchange.com/a/254381)
- [issues with architecture of the node binary](https://github.com/nvm-sh/nvm/issues/2350)

### Installation

1. Clone the repo
   ```sh
   git clone git@github.com:DyuldinKS/superforms.git
   ```
1. Install NPM packages
   ```sh
   npm ci
   ```
1. Create and populate env file inside env folder (`env/dev` for development or `env/prod` for production). You can find template in `env/example`.
1. Init database
   ```sh
   npm run createdb
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Open http://localhost:3000/ and enjoy.

Default auth credentials:

> user: `@bot`
>
> password: `justdoit`.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

The idea of the project belongs to **Ilgin Dmitriy Sergeevich**.

We - as developers - are grateful for opportunity to be a part of this project as well as for knowledge and experience gained during development.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[product-screenshot]: images/screenshot.png
