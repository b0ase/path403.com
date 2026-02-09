import os
import re
import json
from bs4 import BeautifulSoup

def parse_price(soup):
    price_div = soup.find(string=re.compile(r"£\d+-\d+"))
    if price_div:
        return price_div.strip()
    return "N/A"

def parse_features(soup):
    features_section = soup.find('h2', string='Core Features')
    if features_section:
        features_list = features_section.find_next('div')
        if features_list:
            return [feature.text for feature in features_list.find_all('span') if feature.text]
    return []

def parse_tech_stack(soup):
    tech_stack_section = soup.find('h3', string='Technology Stack')
    if tech_stack_section:
        tech_list = tech_stack_section.find_next('div')
        if tech_list:
            return [tech.text for tech in tech_list.find_all('span')]
    return []

def parse_timeline(soup):
    timeline_section = soup.find('h3', string='Delivery Timeline')
    if timeline_section:
        timeline_items = timeline_section.find_next('div', {'class': 'space-y-3'})
        if timeline_items:
            weeks = timeline_items.find_all('div', recursive=False)
            timeline = []
            for week in weeks:
                week_title_div = week.find('div', string=re.compile(r"Week \d+"))
                if week_title_div:
                    week_title = week_title_div.text
                    week_desc = week_title_div.find_next_sibling('div').text
                    timeline.append(f"{week_title}: {week_desc}")
            return timeline
    return []

def parse_description(soup):
    h1 = soup.find('h1')
    if h1:
        p = h1.find_next_sibling('p')
        if p:
            return p.text.strip()
    return "N/A"
    
def parse_what_you_get(soup):
    what_you_get_section = soup.find('h2', string='What You Get')
    if what_you_get_section:
        description_p = what_you_get_section.find_next('p')
        if description_p:
            return description_p.text.strip()
    return "N/A"

def parse_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Use regex to find the main return (...) of the React component
    match = re.search(r'return \((.*?)\);', content, re.DOTALL | re.S)
    if not match:
        return None

    jsx_content = match.group(1)
    
    # Basic conversion of JSX to something BeautifulSoup can handle
    # This is fragile and might need improvement
    html_content = re.sub(r'className=', 'class=', jsx_content)
    html_content = re.sub(r'\{/\*.*?\*/\}', '', html_content) # remove block comments
    html_content = re.sub(r'//.*', '', html_content) # remove line comments
    html_content = re.sub(r'\{`', '', html_content)
    html_content = re.sub(r'`\}', '', html_content)


    soup = BeautifulSoup(html_content, 'html.parser')

    module_name = "Unknown Module"
    module_name_tag = soup.find('h1')
    if module_name_tag:
        # Extract the first navigable string, which is the direct text of the H1
        h1_text = module_name_tag.find(string=True, recursive=False)
        if h1_text:
            module_name = h1_text.strip()
    
    module_data = {
        'module_name': module_name,
        'description': parse_description(soup),
        'price_range': parse_price(soup),
        'what_you_get': parse_what_you_get(soup),
        'core_features': parse_features(soup),
        'tech_stack': parse_tech_stack(soup),
        'delivery_timeline': parse_timeline(soup)
    }
    
    return module_data

def main():
    modules_dir = os.path.join('app', 'modules')
    all_module_data = []

    for module_name in os.listdir(modules_dir):
        module_path = os.path.join(modules_dir, module_name)
        if os.path.isdir(module_path):
            page_file = os.path.join(module_path, 'page.tsx')
            if os.path.exists(page_file):
                print(f"Parsing {page_file}...")
                data = parse_file(page_file)
                if data:
                    all_module_data.append(data)
                else:
                    print(f"  Could not parse component from {page_file}")

    output_file = 'module_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_module_data, f, indent=2, ensure_ascii=False)
        
    print(f"\nSuccessfully extracted data from {len(all_module_data)} modules.")
    print(f"Data saved to {output_file}")


if __name__ == '__main__':
    main() 