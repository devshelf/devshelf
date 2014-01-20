module.exports = function(grunt) {
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
                    'public/assets/js/jquery.simplemodal-0.0.7.min.js',
                    'public/assets/js/mustache.js',
                    'public/assets/js/main.js',
                    'public/assets/js/auth.js',
                    'public/assets/js/voting.js',
                    'public/assets/js/jquery.autoSuggest.js'
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

        watch: {
            main: {
                files: [
                        'public/assets/**/*',
                        'public/templates.html',
                        'public/index.html'
                        ],
                tasks: ['csso:main','uglify:main','htmlcompressor:main'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // Load plugins installed via npm install
    grunt.loadNpmTasks('grunt-csso');
    grunt.loadNpmTasks('grunt-htmlcompressor');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['clean:build','csso:main','uglify:main','htmlcompressor:main','copy:img']);

    grunt.registerTask('runWatch', ['watch']);
};