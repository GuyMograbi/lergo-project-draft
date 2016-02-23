'use strict';

angular.module('lergoApp').service('FilterService', function Filterservice($rootScope) {

	this.languages = [ {
		'id' : 'english',
		'locale' : 'en'
	}, {
		'id' : 'hebrew',
		'locale' : 'he'
	}, {
		'id' : 'arabic',
		'locale' : 'ar'
	}, {
		'id' : 'russian',
		'locale' : 'ru'
	} ];

	this.subjects = [
        'english',
        'math',
        'geometry',
        'science',
        'language',
        'grammar',
        'spelling',
        'biology',
        'chemistry',
        'physics',
        'computers',
        'sustainability',
        'history',
        'geography',
        'art',
        'music',
        'bible',
        'financialEducation',
        'roadSafety',
        'lergo',
        'other'
    ];

	this.status = [ 'private', 'public' ];
	this.reportStatus = [ 'complete', 'incomplete' ];
	this.abuseReportStatus=['pending', 'resolved','dismissed'];

	this.getLocaleByLanguage = function(id) {
		for ( var i = 0; i < this.languages.length; i++) {
			if (id === this.languages[i].id) {
				return this.languages[i].locale;
			}

		}
		return $rootScope.lergoLanguage;
	};

	this.getLanguageByLocale = function(locale) {
		for ( var i = 0; i < this.languages.length; i++) {
			if (locale === this.languages[i].locale) {
				return this.languages[i].id;
			}

		}
		return 'english';
	};
});
