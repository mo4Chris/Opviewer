##Start api server
node server.js in SRC folder

##Start Angular
ng serve

##Start SonarCloud for code quality
sonar-scanner.bat -Dsonar.projectKey=BMO-Opviewer -Dsonar.organization=tcwchris-bitbucket -Dsonar.sources=. -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=e40222d243771c14c187869fe353c5f910913f25