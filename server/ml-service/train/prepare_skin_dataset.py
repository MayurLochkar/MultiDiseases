import os
import pandas as pd
import shutil
from sklearn.model_selection import train_test_split

# ✅ correct paths (your case)
csv_path = r"C:\Users\lochk\Downloads\skin C\HAM10000_metadata.csv"

image_folder = r"C:\Users\lochk\Downloads\skin C\processed_images_dataset\processed_images"
output_folder = "../dataset/Skin"

df = pd.read_csv(csv_path)

# ✅ select 5 classes
classes = ["nv", "mel", "bcc", "akiec", "bkl"]
df = df[df["dx"].isin(classes)]

# split
train_df, test_df = train_test_split(df, test_size=0.2, stratify=df["dx"])

# create folders
for split in ["train", "test"]:
    for cls in classes:
        os.makedirs(f"{output_folder}/{split}/{cls}", exist_ok=True)

# copy images
def copy_images(data, split):
    for _, row in data.iterrows():
        img_name = row["image_id"] + ".jpg"
        label = row["dx"]

        src = os.path.join(image_folder, img_name)
        dst = os.path.join(output_folder, split, label, img_name)

        if os.path.exists(src):
            shutil.copy(src, dst)
        else:
            print("❌ Missing:", src)

copy_images(train_df, "train")
copy_images(test_df, "test")

print("✅ Dataset ready perfectly")