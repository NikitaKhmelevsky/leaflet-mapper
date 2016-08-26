Rails.application.routes.draw do
  root 'static_pages#home'

  get 'hardcore_map', controller: :static_pages, action: :hardcore_map

  resources :clusters, only: :index
end
