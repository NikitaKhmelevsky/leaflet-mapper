Rails.application.routes.draw do
  root 'static_pages#home'

  get 'hardcore_map',   controller: :static_pages, action: :hardcore_map
  get 'spiderfy_issue', controller: :static_pages, action: :spiderfy_issue
  get 'super_simple',   controller: :static_pages, action: :super_simple

  resources :clusters, only: :index
end
