module Search
  module Pin
    extend ActiveSupport::Concern

    included do
      include Elasticsearch::Model
      include Elasticsearch::Model::Callbacks
      include Searchable

      mappings do
        indexes :id, type: 'integer'

        indexes :title, type: 'string'
        indexes :location, type: 'geo_point'
      end

      def as_indexed_json(opts={})
        as_json(only: 'title').merge(location: {
          lat: lat, lon: lon
        })
      end
    end
  end
end
