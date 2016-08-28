# DevShelf.us - Community driven reading shelf

**Project is currently on hold until big rewrite, focusing on other content parsing solutions. If you're willing to support it, please PM [@operatino](https://twitter.com/operatino).**
___

Open source platform for collecting best articles and links about web development. Contribute, group information by tags, and vote for the best content!

___

[DevShelf homepage](https://devshelf.us) || [Contribute interesting articles](https://github.com/devshelf/devshelf-articles)
___

## Contribute

### Install instructions

1. Clone (this) core repo and [articles repo](https://github.com/devshelf/devshelf-articles)
2. Symlink `devshelf-articles` to core repo `/articles-data`
3. Copy `/core/options/_secure-options.json` to `/core/options/secure-options.json` and fill cookie secret, github key for auth, mongodb credentials and prerender token
4. Prepare your hosts file adding `local.host` as the alias to `localhost` (this is important for GH auth on localhost)
5. Run `npm run build && npm start` and enjoy

### Tests

To run functional tests, with running app use `npm test`

