class ClustersController < ApplicationController
  def index
    @response = {}

    @response = ClustersAggregator.new(**clusters_params.symbolize_keys).results

    respond_to do |format|
      format.json do
        render json: @response.to_json
      end
    end
  end

  private

  def clusters_params
    params.permit(:zoom, bounds: [top_left: [:lat, :lng], bottom_right: [:lat, :lng]])
  end
end