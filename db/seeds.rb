NEW_YORK = {
    lat: 40.696688,
    lon: -73.523855
}

1_000_000.times do |i|
  puts "#{i} of 1_000_000"
  Pin.create(
     title: Faker::Name.name,
     lat:   ((rand * 180) - 90),
     lon:   ((rand * 360) - 180)
  )
end

150.times do
  Pin.create(
      title: Faker::Name.name,
      lat:   NEW_YORK[:lat],
      lon:   NEW_YORK[:lon]
  )
end