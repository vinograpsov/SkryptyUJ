require "httparty"
require "nokogiri"

CATEGORY_URL = "https://www.ceneo.pl/Gry_bez_pradu"

def fetch(url)
    HTTParty.get(
        url,
        headers: {
            "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
    ).body
end

def parse_products(html)
    doc = Nokogiri::HTML(html) 
    doc.css("div.cat-prod-row").map do |node|
        {
            title: node.at_css("strong.cat-prod-row__name span")&.text&.strip,
            price: node.at_css("span.price")&.text&.strip,
        }
    end 
end


def run 
    html = fetch(CATEGORY_URL)
    products = parse_products(html)


    products.each_with_index do |product, index|
        puts "Product ##{index + 1}:"
        puts "Title: #{product[:title]}"
        puts "Price: #{product[:price]}"
        puts "-" * 40
    end
end

run