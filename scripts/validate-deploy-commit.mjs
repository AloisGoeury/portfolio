import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const RELEASE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function expectedDeployCommit(version) {
    if (!RELEASE_VERSION_PATTERN.test(version)) {
        throw new Error(
            `La version "${version}" doit respecter le format x.x.x avant un déploiement.`,
        );
    }

    return `portfolio-${version}`;
}

export function validateDeployCommit(version, commitSubject) {
    const expected = expectedDeployCommit(version);
    const received = commitSubject.split(/\r?\n/, 1)[0].trim();

    if (received !== expected) {
        throw new Error(
            [
                'Déploiement bloqué : le titre du commit ne correspond pas à la version.',
                `Attendu : ${expected}`,
                `Reçu : ${received || '(vide)'}`,
            ].join('\n'),
        );
    }

    return expected;
}

async function main() {
    const packageJson = JSON.parse(
        await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    );
    const commitSubject =
        process.env.RAILWAY_GIT_COMMIT_MESSAGE ??
        execFileSync('git', ['log', '-1', '--pretty=%s'], {
            encoding: 'utf8',
        });
    const commitName = validateDeployCommit(packageJson.version, commitSubject);

    console.log(`Déploiement autorisé pour ${commitName}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
