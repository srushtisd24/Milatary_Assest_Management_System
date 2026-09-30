$baseDir = "d:/new project/military-asset-management/backend/src/main/java/com/military/assetmanagement"

New-Item -ItemType Directory -Force -Path "$baseDir/config"
New-Item -ItemType Directory -Force -Path "$baseDir/controller"
New-Item -ItemType Directory -Force -Path "$baseDir/dto"
New-Item -ItemType Directory -Force -Path "$baseDir/entity"
New-Item -ItemType Directory -Force -Path "$baseDir/exception"
New-Item -ItemType Directory -Force -Path "$baseDir/repository"
New-Item -ItemType Directory -Force -Path "$baseDir/security"
New-Item -ItemType Directory -Force -Path "$baseDir/service"

$appProps = "d:/new project/military-asset-management/backend/src/main/resources/application.properties"
Set-Content -Path $appProps -Value @"
spring.application.name=asset-management
spring.datasource.url=jdbc:mysql://localhost:3306/military_asset_management?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=`${DB_USERNAME:root}
spring.datasource.password=`${DB_PASSWORD:root}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

jwt.secret=`${JWT_SECRET:8a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4}
jwt.expiration=86400000

springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"@
