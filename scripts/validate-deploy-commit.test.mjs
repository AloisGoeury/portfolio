import assert from 'node:assert/strict';
import test from 'node:test';
import {
    expectedDeployCommit,
    validateDeployCommit,
} from './validate-deploy-commit.mjs';

test('builds the expected commit name from the package version', () => {
    assert.equal(expectedDeployCommit('1.2.3'), 'portfolio-1.2.3');
});

test('accepts only the exact matching commit title', () => {
    assert.equal(
        validateDeployCommit('1.2.3', 'portfolio-1.2.3\n'),
        'portfolio-1.2.3',
    );
});

test('ignores the commit body after a matching title', () => {
    assert.equal(
        validateDeployCommit(
            '1.2.3',
            'portfolio-1.2.3\n\nDétails de la version.',
        ),
        'portfolio-1.2.3',
    );
});

test('rejects a commit title with a different version', () => {
    assert.throws(
        () => validateDeployCommit('1.2.3', 'portfolio-1.2.4'),
        /Attendu : portfolio-1\.2\.3/,
    );
});

test('rejects additional text in the commit title', () => {
    assert.throws(
        () => validateDeployCommit('1.2.3', 'release portfolio-1.2.3'),
        /Déploiement bloqué/,
    );
});

test('rejects package versions outside the x.x.x format', () => {
    assert.throws(() => expectedDeployCommit('1.2.3-beta.1'), /format x\.x\.x/);
});
