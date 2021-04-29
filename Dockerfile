# build stage
FROM node:alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable as production-stage

# Provide a custom nginx.conf, tweaked for Docker use
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site.conf /etc/nginx/nginx.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

RUN adduser --disabled-password appuser && chown -R appuser /usr/share/nginx/html
RUN chown -R appuser /var/cache/nginx && \
       chown -R appuser /var/log/nginx && \
       chown -R appuser /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
       chown -R appuser /var/run/nginx.pid

USER appuser

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]