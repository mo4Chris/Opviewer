##Start api server in SRC folder
node server.js

##Start Angular
ng serve

##Start SonarCloud for code quality
sonar-scanner.bat -Dsonar.projectKey=BMO-Opviewer -Dsonar.organization=tcwchris-bitbucket -Dsonar.sources=. -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=e40222d243771c14c187869fe353c5f910913f25

##Start api server on remote server
ng serve --host 0.0.0.0

##Fix crypto bug
node patch.js

##.Htaccess code (In case of deletion)
Order Deny,Allow
Deny from all
Allow from (insert IP's of whitelisted users)

RewriteEngine on
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule . index.html [L]

## Colors
Color - rgb - description/usecase
White - 255, 255, 255 - Datepicker day disabled, video request loading
Light blue  - 198, 233, 255 - Datepicker day has transfer
Light yellow  - 255, 255, 211 - Datepicker day has transit but no transfer