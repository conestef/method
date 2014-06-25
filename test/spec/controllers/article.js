/*global describe, beforeEach, module, inject, it, expect */

describe('Controller: ArticleCtrl', function () {

    'use strict';

    // load the controller's module
    beforeEach(module('Volusion.controllers'));

    // ReSharper disable once InconsistentNaming
    var controller,
        scope,
        article = {
            data: {
                id: 1,
                title: 'foo',
                caption: 'bar',
                body: 'baz',
                seo: {
                    title: 'qux',
                    description: 'quux',
                    keywords: 'garply'
                }
            }
        };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        $rootScope.seo = {
            title: 'foo',
            description: 'bar',
            keywords: 'baz'
        };

        scope = $rootScope.$new();
        controller = $controller('ArticleCtrl', {
            $scope: scope,
            article: article
        });
    }));

    it('should attach the article data to the scope', function () {
        expect(scope.article).to.deep.equal(article.data);
    });

    it('updates the root scope\'s seo object with the article seo', function () {
        expect(scope.seo).to.deep.equal(article.data.seo);
    });

});
