import json
import glob
import os
import undetected_chromedriver as uc
import pandas as pd
import pickle
from dataclasses import dataclass, asdict
import time
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@dataclass
class prof_infos:
    prof_name: list[str]
    university: list[str]
    academic_rank: list[str]

    def append(self, name, uni, rank):
        self.prof_name.append(name)
        self.university.append(uni)
        self.academic_rank.append(rank)


@dataclass
class courses:
    course_code: list[str]
    course_name: list[str]

    def append(self, name, code):
        self.course_name.append(name)
        self.course_code.append(code)


@dataclass
class reviews:
    course_name: list[str]
    professor_name: list[str]
    rating: list[str]
    content: list[str]
    created_at: list[str]

    def append(self, course, prof, rating, content, date):
        self.course_name.append(course)
        self.professor_name.append(prof)
        self.rating.append(rating)
        self.content.append(content)
        self.created_at.append(date)


options = uc.ChromeOptions()
prefs = {
    "download.default_directory": os.path.abspath("./docs"),
    "download.prompt_for_download": False,
    "directory_upgrade": True,
}
options.add_experimental_option("prefs", prefs)

driver = uc.Chrome(options=options, version_main=147)


def help_find_ele(element, by, selector, pos=0, default=""):
    items = element.find_elements(by, selector)
    if not items:
        return default
    return items[pos].text


def scrape_review_vnu_hub():
    prof_list = prof_infos([], [], [])
    reviews_list = reviews([], [], [], [], [])
    driver.get("https://vnudocshub.com/reviews?page=1")
    wait = WebDriverWait(driver, 2)
    all_prof_url = []
    while True:
        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//a[starts-with(@href, '/reviews/')]")
            )
        )
        elements = driver.find_elements(
            By.XPATH, "//a[starts-with(@href, '/reviews/')]"
        )
        all_prof_url += list(set(element.get_attribute("href") for element in elements))
        try:
            next_btn = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[@aria-label='Go to next page']")
                )
            )
            next_btn.click()
            wait.until(EC.staleness_of(elements[0]))
            time.sleep(0.5)
        except Exception:
            print("all the button")
            break

    print(f"Found {len(all_prof_url)} prof")

    for url in all_prof_url:
        print(f"now: {url}")
        driver.get(url)
        wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//p[@class='text-3xl font-bold']",
                )
            ),
        )

        prof_name = driver.find_element(
            By.XPATH,
            "//p[@class='text-3xl font-bold']",
        ).text
        prof_department = driver.find_element(
            By.XPATH,
            "//p[@class='text-base font-semibold uppercase text-gray-800']",
        ).text
        prof_list.append(name=prof_name, uni=prof_department, rank="null")

        while True:
            try:
                wait = WebDriverWait(driver, 10)
                time.sleep(0.2)
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located(
                        (
                            By.XPATH,
                            "//div[@class='py-6 border-b-2 border-black last:border-b-0']",
                        )
                    )
                )

                cmt_elements = driver.find_elements(
                    By.XPATH,
                    "//div[@class='py-6 border-b-2 border-black last:border-b-0']",
                )
            except Exception:
                break

            for cmt_element in cmt_elements:
                try:
                    star_count = 0
                    stars = cmt_element.find_elements(By.TAG_NAME, "svg")[1:-1]
                    star_count = (
                        sum(
                            1
                            for s in stars
                            if s.get_attribute("fill") == "currentColor"
                        )
                        or 1
                    )
                    course = help_find_ele(
                        cmt_element,
                        By.TAG_NAME,
                        "h4",
                    )
                    content = help_find_ele(cmt_element, By.CLASS_NAME, "prose", pos=-1)
                    date = help_find_ele(cmt_element, By.TAG_NAME, "p", pos=0)

                    print(
                        f"date: {date}\n subject: {course}\n content:{content}\n star: {star_count}"
                    )
                    reviews_list.append(
                        course=course,
                        rating=star_count,
                        date=date,
                        content=content,
                        prof=prof_name,
                    )
                except Exception:
                    continue
            try:
                next_btn = wait.until(
                    EC.element_to_be_clickable(
                        (By.XPATH, "//button[@aria-label='Go to next page']")
                    )
                )
                next_btn.click()
                wait.until(EC.staleness_of(cmt_elements[0]))
                time.sleep(0.5)

            except Exception:
                print("all the button")
                break
    driver.quit()
    print("saving data")
    prof_list = asdict(prof_list)
    reviews_list = asdict(reviews_list)
    with open("prof_list.pkl", "wb") as f:
        pickle.dump(prof_list, f)
    with open("reviews_list.pkl", "wb") as f:
        pickle.dump(reviews_list, f)


# 317
def scrape_from_dhqg_xyz():
    i = 1
    j = 1
    wait = WebDriverWait(driver, 3)
    prof_list = prof_infos([], [], [])
    reviews_list = reviews([], [], [], [], [])

    while True:
        try:
            driver.get(f"https://dhqg.xyz/teacher.php?id={i}&page={j}")
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
            prof_info = driver.find_element(By.TAG_NAME, "h1").text
            uni = driver.find_element(
                By.XPATH,
                ".//span[@class='text-primary font-headline font-bold text-sm tracking-widest uppercase']",
            ).text
            prof_info = prof_info.split(".", 2)
            prof_list.append(name=prof_info[-1], uni=uni, rank=prof_info[0])
            while True:
                url = f"https://dhqg.xyz/teacher.php?id={i}&page={j}"
                print(f"now: {url}")

                driver.get(url)
                try:
                    wait.until(EC.presence_of_element_located((By.TAG_NAME, "article")))
                    cmt_elements = driver.find_elements(By.TAG_NAME, "article")
                except Exception:
                    i += 1
                    j = 1
                    break
                for cmt_element in cmt_elements:
                    try:
                        course = cmt_element.find_element(
                            By.XPATH,
                            ".//p[@class='text-xs text-on-surface-variant']",
                        ).text
                        star_count = (
                            cmt_element.find_element(
                                By.XPATH,
                                ".//div[@class='flex justify-between items-start mb-6']",
                            )
                            .find_elements(By.TAG_NAME, "span")[-1]
                            .text
                        )
                        content_tags = cmt_element.find_element(
                            By.XPATH,
                            ".//div[@class='text-on-surface-variant leading-relaxed mb-6']",
                        ).find_elements(By.TAG_NAME, "p")
                        contents = "\n".join([tag.text for tag in content_tags])

                        date = cmt_element.find_element(
                            By.XPATH,
                            ".//span[@class='text-xs text-on-surface-variant']",
                        ).text

                        reviews_list.append(
                            course=course,
                            rating=star_count,
                            date=date,
                            content=contents,
                            prof=prof_info[-1],
                        )

                        print(
                            f"prof: {prof_info[-1]}\ndate: {date}\n subject: {course}\n content:{contents}\n star: {star_count}"
                        )
                    except Exception as e:
                        j += 1
                        print(f"catch {e}")
                        continue
                j += 1

        except Exception:
            print("all the button")
            break
    driver.quit()
    print("saving data")
    prof_list = asdict(prof_list)
    reviews_list = asdict(reviews_list)
    with open("prof_list2.pkl", "wb") as f:
        pickle.dump(prof_list, f)
    with open("reviews_list2.pkl", "wb") as f:
        pickle.dump(reviews_list, f)


def scrape_from_vnu_doc():
    doc = Docs([], [], [], [])
    i = 0
    driver.get("https://vnudocshub.com/documents")
    wait = WebDriverWait(driver, 10)
    ele_xpath = "//a[@class='border-2 border-black bg-white flex flex-col h-full transition-all duration-200 ease-in-out hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer no-underline text-black']"

    while True:
        i += 1
        print(i)
        wait.until(EC.presence_of_element_located((By.XPATH, ele_xpath)))
        elements = driver.find_elements(
            By.XPATH,
            ele_xpath,
        )
        for ele in elements:
            info = str(ele.text).split("\n")
            tag = info[0]
            name = info[1]
            date = info[2]
            link = ele.get_property("href")
            doc.append(tag, name, date, link)
        try:
            next_btn = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[@aria-label='Go to next page']")
                )
            )
            next_btn.click()
            wait.until(EC.staleness_of(elements[0]))
        except Exception:
            print("all the button")
            break
    driver.quit()
    print("saving data")
    doc = asdict(doc)
    with open("doc.pkl", "wb") as f:
        pickle.dump(doc, f)


@dataclass
class Docs:
    tag: list[str]
    name: list[str]
    date: list[str]
    link: list[str]

    def append(self, tag, name, date, link):
        self.tag.append(tag)
        self.name.append(name)
        self.date.append(date)
        self.link.append(link)


def download_doc(driver):
    df = pd.DataFrame(pd.read_pickle("doc.pkl"))
    df1 = df.to_json(orient="records", indent=4)
    docs = json.loads(df1)

    duration = 100
    dir = [f.split("/")[-1] for f in glob.glob("./docs/*")]
    print(dir)
    for count, doc in list(enumerate(docs)):
        print(count)
        if doc["name"] in dir:
            continue
        driver.get(str(doc["link"]))
        wait = WebDriverWait(driver, 1)
        folder_path = f"./docs/{doc['name']}"
        os.makedirs(folder_path, exist_ok=True)
        try:
            wait.until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//span[contains(text(), 'Download')]",
                    )
                )
            )
            print("---------")
            download_buttons = driver.find_elements(
                By.XPATH,
                "//span[contains(text(), 'Download')]",
            )
            for download_button in download_buttons:
                end_time = time.time() + duration
                newest_file = None
                while download_button.text == "DOWNLOAD" and time.time() < end_time:
                    download_button.click()
                    time.sleep(0.1)
                while not newest_file and time.time() < end_time:
                    try:
                        files = [
                            f
                            for f in glob.glob("./docs/*")
                            if os.path.isfile(f) and f.split(".")[-1] != "crdownload"
                        ]
                        newest_file = max(files, key=os.path.getctime)
                    except Exception:
                        time.sleep(1)
                        continue
                    print(newest_file)
                if newest_file:
                    os.replace(
                        newest_file,
                        os.path.abspath(
                            f"./docs/{doc['name']}/{newest_file.split('/')[-1]}"
                        ),
                    )

        except Exception as e:
            print(f"{e}")
            pass


if __name__ == "__main__":
    dirs = glob.glob("./docs/*")
    for dir in dirs:
        try:
            os.rmdir(dir)
        except:
            continue

    download_doc(driver)
