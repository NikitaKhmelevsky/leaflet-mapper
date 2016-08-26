class ClustersAggregator
  attr_reader :bounds, :zoom

  def initialize(bounds:, zoom:)
    @bounds = bounds
    @zoom   = zoom
  end

  def results
    @results ||= client.search(search_params)
  end

  private

  def self.index_name(index_name)
    @index_name = index_name
  end

  def self.document_type(document_type)
    @document_type = document_type
  end

  def index_name
    self.class.instance_variable_get(:@index_name)
  end

  def document_type
    self.class.instance_variable_get(:@document_type)
  end

  def search_params
    { search_type: 'count',
      index: index_name,
      type:  document_type,
      query_cache: true,
      body: query }
  end

  def query
    {
      query: {
        filtered: {
          filter: {
            bool: {
              must: [
                {
                  geo_bounding_box: {
                    location: {
                      top_left: {
                        lat: bounds['top_left']['lat'],
                        lon: bounds['top_left']['lng']
                      },
                      bottom_right: {
                        lat: bounds['bottom_right']['lat'],
                        lon: bounds['bottom_right']['lng']
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      aggs: {
        grid: {
          geohash_grid: {
            field: 'location',
            precision: zoom,
          }
        }
      }
    }
  end

  def client
    @client ||= Elasticsearch::Client.new
  end
end