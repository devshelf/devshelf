# Manual

Everybody from community could contribute their materials (articles, books, tools) to [DevShelf](http://devshelf.us) library.

To add your information all you need to do, is to select category by `.json` file in this directory (or create your own), and leave a pull request.

First object in `.json` file is a `tag` name, that will be searchable through [DevShelf](http://devshelf.us) website, inside it we could store as much materials as we want, just push new item to array.

Available additional information about links that you contribute could be easily added with nested objects:

```json
{
    "css methodologies": [
            {
                "url": "http://operatino.github.io/MCSS/en/",
                "title": "Multilayer CSS",
                "author": "Robert Haritonov",
                "author-link": "http://rhr.me",
                "author-mail": "r@rhr.me",
                "author-mail-hash": "r@rhr.me",
                "id":"mcss",
                "tags": [
                    "css",
                    "best practises"
                ]
            }
        ]
}
```

Where,

* *`url` - link to the article or interesting material
* *`title` - its title
* `description` - article description, not vital but usefull
* `auhtor-*` - author name, link to info about him and email for gravatar
* `id` - ID's are optional, will be generated automatically
* `tags` - array with additional tags, that also will be searchable

\* obligatory fields
