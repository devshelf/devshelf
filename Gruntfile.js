module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Tasks
    grunt.initConfig({
        copy: {
            img: {
                files: [
                    {
                    expand: true,
                    cwd: 'public/assets/img/',
                    src: '**',
                    dest: 'public/build/img/'
                    }
                ]
            }
        },

        clean: {
            build: {
                src: ['public/build/']
            }
        },

        csso: {
          main: {
            files: {
              'public/build/css/all.min.css': [
                  'public/assets/css/pure.css',
                  'public/assets/css/font-awesome.css',
                  'public/assets/css/main.css',
                  'public/assets/css/pricing.css',
                  'public/assets/css/blog.css',
                  'public/assets/css/form.css',
                  'public/assets/css/jquery.autoSuggest.css'
              ]
            }
          }
        },

        uglify: {
            main: {
              files: {
                'public/build/js/all.min.js': [
                    'public/assets/js/utils.js',
                    'public/assets/js/mustache.js',
                    'public/assets/js/main.js',
                    'public/assets/js/auth.js',
                    'public/assets/js/voting.js',
                    'public/assets/js/jquery.autoSuggest.js',
                    'public/assets/js/jquery.autocomplete.js',
                    'public/assets/js/form.js'
                ]
              }
            }
        },

        htmlcompressor: {
            main: {
              files: {
                'public/build/index.html': 'public/index.html',
                'public/build/templates.html': 'public/templates.html'
              },
              options: {
                type: 'html',
                preserveServerScript: true
              }
            }
        },

        hashres: {
            main: {
                // Files to hash
                src: [
                    'public/build/js/all.min.js',
                    'public/build/css/all.min.css'],
                // File that refers to above files and needs to be updated with the hashed name
                dest: 'public/build/index.html'
            }
        },

        watch: {
            main: {
                files: [
                        'public/assets/**/*',
                        'public/templates.html',
                        'public/index.html'
                        ],
                tasks: ['csso:main','uglify:main','htmlcompressor:main','hashres:main'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    //TODO: process only new files, add modules loader

    grunt.registerTask('default', [
        'clean:build',
        'csso:main',
        'uglify:main',
        'htmlcompressor:main',
        'copy:img',
        'hashres:main'
    ]);

    grunt.registerTask('runWatch', ['watch']);
};
