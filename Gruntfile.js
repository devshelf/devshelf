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
            },

            favicons: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/assets/favicons/',
                        src: '**',
                        dest: 'public/build/favicons/'
                    }
                ]
            },

            html: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/',
                        src: '*.html',
                        dest: 'public/build/'
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
                ],
                'public/build/js/jquery-2.0.3.min.js': [
                    'public/assets/js/jquery-2.0.3.min.js'
                ]
              }
            }
        },

        htmlmin: {
            main: {
                files: {
                    'public/build/index.html': 'public/index.html',
                    'public/build/templates.html': 'public/templates.html'
                },
                options: {
                    processScripts: ['text/template'],
                    removeComments: true,
                    collapseWhitespace: true
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
                tasks: ['csso:main','uglify:main','htmlmin:main','hashres:main'],
                options: {
                    nospawn: true
                }
            }
        },

		casperjs: {
			files: ['tests/*.js']
		}
    });

    //TODO: process only new files, add modules loader

    grunt.registerTask('clean', ['clean:build']);
    grunt.registerTask('default', [
        'csso:main',
        'uglify:main',
        'htmlmin:main',
        'copy:img',
        'copy:favicons',
        'hashres:main'
    ]);

    grunt.registerTask('runWatch', ['watch']);
    grunt.registerTask('test', ['casperjs']);
};
