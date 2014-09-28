
module.exports = function(config){

    config.set({
        frameworks : ['jasmine'],
        browsers : ['Chrome'] ,
        port: 8080,
        basePath: '',
        files : [
            'app/bower_components/jquery/jquery.js',
            'app/bower_components/lodash/dist/lodash.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/string-format-js/format.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/angular-ui-utils/ui-utils.js',
            'app/bower_components/angular-markdown-directive/markdown.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-local-storage/angular-local-storage.js',
            'app/bower_components/google-code-prettify/src/prettify.js',
            'app/bower_components/angular-adaptive-speech/angular-adaptive-speech.js',
            'app/scripts/*.js',
            '.tmp/html2js/*.js',
            'app/scripts/**/*.js',
            'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],
        exclude : [],
        reporters : ['failed'],
        runnerPort: 9100,
        colors: true,
        logLevel: 'info',
        autoWatch: false,
        captureTimeout: 15000,
        singleRun: false
    });

};
