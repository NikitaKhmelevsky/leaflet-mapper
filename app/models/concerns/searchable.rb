module Searchable
  extend ActiveSupport::Concern

  included do
    index_name "#{Rails.application.class.parent_name.underscore}_#{Rails.env}_#{table_name}"

    settings index: {
        number_of_shards:   Rails.application.config.elasticsearch['number_of_shards'],
        number_of_replicas: Rails.application.config.elasticsearch['number_of_replicas'],
    }
  end
end
