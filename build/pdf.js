/** !
 * Upgrade PDF.js
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const shell = require('shelljs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra')

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git')
  shell.exit(1)
}

const cacheDir = 'pdf'
const repoRoot = 'pdf'
const publicPDFRoot = path.join(__dirname, '../assets/pdf')
const pdfFiles = [
  'build/pdf.js',
  'build/pdf.worker.js',
  'web/debugger.js',
  'web/viewer.js',
  'web/viewer.html',
  'web/viewer.css',
]
const pdfDirs = ['web/cmaps', 'web/images', 'web/locale']
const files = [...pdfFiles, ...pdfDirs]

// shell.cd(path.resolve(__dirname))

// shell.rm('-rf', cacheDir)

// exec(
//   `git clone https://github.com/mozilla/pdf.js.git ${cacheDir} --single-branch --branch master --depth 1 --progress --verbose`,
//   'Error: Git clone failed',
// )

shell.cd('./' + cacheDir)

startUpgrade()

async function startUpgrade() {
  shell.echo('\nChecking files.', path.join(__dirname, repoRoot))
  await Promise.all(files.map((p) => exists(path.join(__dirname, repoRoot, p))))

  shell.echo('\nModifying files.')
  await Promise.all([modifyViewrJS(), modifyViewerHTML()])

  await fs.ensureDir(publicPDFRoot)

  shell.echo('\nCloning files.')
  cleanInit()

  await cloneFiles()

  shell.echo('\nCleaning files.')
  shell.cd(path.resolve(__dirname))
  shell.rm('-rf', cacheDir)

  shell.echo('\ndone.')
}

async function modifyViewrJS() {
  const viewerPath = path.join(__dirname, repoRoot, 'web/viewer.js')
  let file = await fs.readFile(viewerPath, 'utf8')

  file = '/* saladict */ window.__SALADICT_PDF_PAGE__ = true;\n' + file

  // change default pdf
  const defaultPDFTester =
    /defaultUrl = {[\s\S]*?value: (['"]\S+?.pdf['"]),[\s\S]*?kind: OptionKind\.VIEWER/
  if (!defaultPDFTester.test(file)) {
    shell.echo('Could not locate default pdf in viewer.js')
    shell.exit(1)
  }
  file = file.replace(defaultPDFTester, (m, p1) =>
    m.replace(p1, "/* saladict */'/assets/default.pdf'"),
  )

  // disable url check
  const validateTester = /validateFileURL\(file\);/
  if (!validateTester.test(file)) {
    shell.echo('Could not locate validateFileURL in viewer.js')
    shell.exit(1)
  }
  file = file.replace(validateTester, '/* saladict */')

  // force dark mode
  const viewCssTester = /"viewerCssTheme": 0,/
  if (!viewCssTester.test(file)) {
    shell.echo('Could not locate viewerCssTheme config in viewer.js')
    shell.exit(1)
  }
  file = file.replace(viewCssTester, '"viewerCssTheme": 2, /* saladict */')

  await fs.writeFile(viewerPath, file)
}

async function modifyViewerHTML() {
  const viewerPath = path.join(__dirname, repoRoot, 'web/viewer.html')
  let file = await fs.readFile(viewerPath, 'utf8')

  if (!file.includes(`</body>`)) {
    shell.echo('Could not locate </body> in viewer.html')
    shell.exit(1)
  }

  // Load Saladict dict panel
  file = file.replace(
    `</body>`,
    `
    <!-- Saladict -->
    <script src="/assets/browser-polyfill.min.js"></script>
    <script src="/assets/inject-dict-panel.js"></script>
    <script src="/assets/vimium-c-injector.js"></script>
  </body>
`,
  )

  await fs.writeFile(viewerPath, file)
}

function cleanInit() {
  pdfDirs.forEach((name) => {
    shell.rm('-rf', path.join(publicPDFRoot, name))
  })
}

async function exists(path) {
  try {
    await fs.access(path)
  } catch (e) {
    shell.echo(path + ' not exist')
    shell.exit(1)
  }
}

function exec(command, errorMsg) {
  const execResult = shell.exec(command)

  if (execResult.code !== 0) {
    if (errorMsg) {
      shell.echo(errorMsg)
    }
    shell.echo(execResult.stdout)
    shell.echo(execResult.stderr)
    shell.exit(1)
  }
}

async function cloneFiles() {
  for (const pdfFile of pdfFiles) {
    const targetPath = path.join(publicPDFRoot, pdfFile)
    await fs.ensureFile(targetPath)
    await fs.copy(path.join(__dirname, repoRoot, pdfFile), targetPath)
  }

  const restPdfDirs = pdfDirs.filter((name) => name !== 'web/locale')

  for (const pdfDir of restPdfDirs) {
    const targetPath = path.join(publicPDFRoot, pdfDir)
    await fs.ensureDir(targetPath)
    await fs.copy(path.join(__dirname, repoRoot, pdfDir), targetPath)
  }

  // copy locale.properties
  await fs.ensureDir(path.join(publicPDFRoot, 'web/locale'))
  await fs.copy(
    path.join(__dirname, repoRoot, 'web/locale/locale.properties'),
    path.join(publicPDFRoot, 'web/locale/locale.properties'),
  )

  const locales = (
    await fs.readdir(path.join(__dirname, repoRoot, 'web/locale'))
  ).filter(
    (name) =>
      name.startsWith('en') ||
      name.startsWith('zh') ||
      /^(ja|ko|uk)$/.test(name),
  )

  for (const locale of locales) {
    const targetPath = path.join(publicPDFRoot, 'web/locale', locale)
    await fs.ensureDir(targetPath)
    await fs.copy(
      path.join(__dirname, repoRoot, 'web/locale', locale),
      targetPath,
    )
  }
}
