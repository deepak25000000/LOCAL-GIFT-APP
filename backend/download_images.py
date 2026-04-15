import psycopg2
import os
import requests
import json
import time
from duckduckgo_search import DDGS
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')

def fetch_image_from_ddg(query):
    # Retry loop
    for attempt in range(3):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.images(query, max_results=5))
                if results:
                    for res in results:
                        url = res['image']
                        # verify image exists
                        try:
                            head = requests.head(url, timeout=5)
                            if head.status_code == 200:
                                return url
                        except:
                            continue
                    return results[0]['image']
        except Exception as e:
            print(f"Error fetching DDG {query}: {e}")
            time.sleep(2)
    return None

def download_and_save(url, dest_path):
    try:
        r = requests.get(url, timeout=10)
        with open(dest_path, 'wb') as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("SELECT id, title FROM items")
    items = cur.fetchall()
    
    os.makedirs('public/uploads', exist_ok=True)
    
    print(f"Found {len(items)} items. Fetching real images...")
    
    for item_id, title in items:
        img_name = f"item_{item_id}.jpg"
        img_path = f"public/uploads/{img_name}"
        img_url_db = f"/uploads/{img_name}"
        
        print(f"Processing '{title}'...")
        
        # Determine better query
        if "PlayStation 5" in title:
            query = "PlayStation 5 console"
        else:
            query = title + " clear product photography"
            
        url = fetch_image_from_ddg(query)
        
        if url:
            print(f"Found URL: {url}")
            success = download_and_save(url, img_path)
            if success:
                # Update DB
                cur.execute("DELETE FROM item_images WHERE item_id = %s", (item_id,))
                cur.execute("INSERT INTO item_images (item_id, image_url) VALUES (%s, %s)", (item_id, img_url_db))
                conn.commit()
                print(" -> Saved and updated DB.")
            else:
                print(" -> Download failed.")
        else:
            print(" -> No image found.")
            
        time.sleep(1) # Be nice to DDG
        
    cur.close()
    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()
