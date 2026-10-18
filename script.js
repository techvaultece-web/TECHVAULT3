/* =========================
SUPABASE CONNECTION
========================= */

const SUPABASE_URL =
"https://gvxxifjubwyddhnjjlko.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eHhpZmp1Ynd5ZGRobmpqbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxODc1MTksImV4cCI6MjEwNDc2MzUxOX0.HbVaRFSZJ6qd7ZirEe1QNVwr-HXAnfMwPq1fiEgDSnk";

const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const STORAGE_BUCKET= "prototype-files";

/* =========================
SAMPLE PROTOTYPE DATA
========================= */

let prototypes = []

let currentEditID = null;
let currentEditData = null;

async function loadPrototypes(){

const {data,error}=await supabaseClient
.from("prototypes")
.select("*")
.order("id",{ascending:true});

if(error){

console.log(error.message);
return;

}

prototypes = data || [];

}

/* =========================
ENTER DASHBOARD
========================= */

function enterDashboard() {

document.getElementById("welcome").style.display = "none";

document.querySelector(".sidebar").style.display = "block";

document.querySelector(".dashboard").style.display = "block";

showHome();

}

/* =========================
HIDE ALL SECTIONS
========================= */

function hideSections() {

document.getElementById("home").style.display = "none";

document.getElementById("addPrototype").style.display = "none";

document.getElementById("categories").style.display = "none";

document.getElementById("about").style.display = "none";

document.getElementById("viewPrototype").style.display = "none";

document.getElementById("editPrototype").style.display = "none";

}

/* =========================
HOME
========================= */

async function showHome() {
    hideSections();

    document.getElementById("home").style.display = "block";

    await loadPrototypes();
}

/* =========================
UPLOAD FILE TO STORAGE
========================= */

async function uploadFile(file, folder, prototypeName) {
    if (!file) return null;

    const prototypeFolder = (prototypeName || "unnamed-prototype")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "unnamed-prototype";

    const safeFileName = file.name.replace(/[^\w.-]+/g, "_");

    const filePath =
        folder + "/" + prototypeFolder + "/" +
        Date.now() + "_" + safeFileName;

    const { error } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

    if (error) {
        console.error("Upload failed:", error.message);
        throw error;
    }

    const { data } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}


async function deleteFile(fileUrl) {
    if (!fileUrl) return;

    const marker =
        "/storage/v1/object/public/" + STORAGE_BUCKET + "/";

    const markerIndex = fileUrl.indexOf(marker);

    if (markerIndex === -1) {
        throw new Error("Invalid Storage URL: " + fileUrl);
    }

    const encodedPath =
        fileUrl.substring(markerIndex + marker.length).split("?")[0];

    let filePath;

    try {
        filePath = decodeURIComponent(encodedPath);
    } catch (error) {
        filePath = encodedPath;
    }

    const { data, error } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error("Delete failed:", filePath, error.message);
        throw error;
    }

    console.log("Storage delete response:", data);
    console.log("Attempted file deletion:", filePath);
}


async function deleteMultipleFiles(pictures){
    if(!pictures){
        return;
    }

    const paths = 
    pictures.split(",")
}
/* =========================
ADD PROTOTYPE
========================= */

function showAdd() {

hideSections();

document.getElementById("addPrototype").style.display = "block";

}

/* =========================
CATEGORIES
========================= */

function showCategories() {

hideSections();

document.getElementById("categories").style.display = "block";

}

/* =========================
ABOUT
========================= */

function showAbout() {

hideSections();

document.getElementById("about").style.display = "block";

}

/* =========================
SEARCH PROTOTYPES
========================= */

function searchPrototypes(){

const searchInput =
document.getElementById("searchBar")
.value
.toLowerCase()
.trim();

const searchResults =
document.getElementById("searchResults");

const noMessage =
document.getElementById("noPrototypeMessage");

searchResults.innerHTML = "";

if(searchInput === ""){

noMessage.style.display="none";

return;

}


const results =
prototypes.filter(function(prototype){

return prototype.name
.toLowerCase()
.includes(searchInput);

});



if(results.length === 0){

noMessage.style.display="block";

return;

}

noMessage.style.display="none";



results.forEach(function(prototype){

searchResults.innerHTML += `

<div class="search-result-card">

<h3>
${prototype.name}
</h3>

<p>
${prototype.course}
</p>

<button
onclick="viewPrototype(${prototype.id})">

VIEW

</button>

</div>

`;

});

}

/* =========================
DISPLAY PROTOTYPES
========================= */

function displayPrototypes(list) {

const tableBody =
    document.getElementById("prototypeTableBody");

const table =
    document.getElementById("prototypeTable");

const noMessage =
    document.getElementById("noPrototypeMessage");

tableBody.innerHTML = "";

if (list.length === 0) {

    table.style.display = "none";

    noMessage.style.display = "block";

    return;

}

table.style.display = "table";

noMessage.style.display = "none";

list.forEach(function(prototype) {

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td class="prototype-name">
            ${prototype.name}
        </td>

        <td class="prototype-course">
            ${prototype.course}
        </td>

        <td class="actions">

            <button
                type="button"
                onclick="viewPrototype(${prototype.id})"
            >
                VIEW
            </button>

            <button
                type="button"
                onclick="editPrototype(${prototype.id})"
            >
                EDIT
            </button>

            <button
                type="button"
                onclick="deletePrototype(${prototype.id})"
            >
                DELETE
            </button>

        </td>

    `;

    tableBody.appendChild(row);

});

}

/* =========================
SHOW CATEGORY
========================= */

function showCategory(category) {

hideSections();

document.getElementById("categories").style.display = "block";

document.getElementById("categoryTitle").innerText =
    category + " Prototypes";

const categoryTableBody =
    document.getElementById("categoryTableBody");

const table =
    document.getElementById("categoryTable");

const noMessage =
    document.getElementById("noCategoryPrototype");

categoryTableBody.innerHTML = "";

const categoryPrototypes =
    prototypes.filter(function(prototype) {

        return prototype.course === category;

    });

if (categoryPrototypes.length === 0) {

    table.style.display = "none";

    noMessage.style.display = "block";

    return;

}

table.style.display = "table";

noMessage.style.display = "none";

categoryPrototypes.forEach(function(prototype) {

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td class="prototype-name">
            ${prototype.name}
        </td>

        <td class="actions">

            <button
                type="button"
                onclick="viewPrototype(${prototype.id})"
            >
                VIEW
            </button>

            <button
                type="button"
                onclick="editPrototype(${prototype.id})"
            >
                EDIT
            </button>

            <button
                type="button"
                onclick="deletePrototype(${prototype.id})"
            >
                DELETE
            </button>

        </td>

    `;

    categoryTableBody.appendChild(row);

});

}

/* =========================
VIEW PROTOTYPE
========================= */

function viewPrototype(id) {

    const prototype = prototypes.find(function(item) {
        return item.id === id;
    });

    if (!prototype) {
        return;
    }

    /* SHOW VIEW PAGE */

    hideSections();

    document.getElementById("viewPrototype")
        .style.display = "block";

    /* PROTOTYPE DETAILS */

    document.getElementById("viewTitle")
        .innerText = prototype.name || "Prototype";

    document.getElementById("viewPrototypeName")
        .innerText = prototype.name || "—";

    document.getElementById("viewCourse")
        .innerText = prototype.course || "—";

        document.getElementById("viewAcademicYear")
    .innerText = prototype.academic_year || "—";

        setRichTextValue("viewDescription", prototype.description || "");
setRichTextValue("viewPurpose", prototype.purpose || "");
setRichTextValue("viewComponents", prototype.components || "");
setRichTextValue("viewMembers", prototype.members || "");

["viewDescription", "viewPurpose", "viewComponents", "viewMembers"]
    .forEach(function(id) {
        const element = document.getElementById(id);

        if (!element.innerHTML.trim()) {
            element.textContent = "—";
        }
    });

    setupShowMore("viewDescription");
setupShowMore("viewPurpose");
setupShowMore("viewComponents");
setupShowMore("viewMembers")

    

    /* =========================
       SCHEMATIC DIAGRAM
    ========================= */

    const schematic =
        document.getElementById("viewSchematic");

    const noSchematic =
        document.getElementById("viewNoSchematic");

    if (prototype.schematic) {

        schematic.src = prototype.schematic;

        schematic.style.display = "block";

        noSchematic.style.display = "none";
        schematic.onclick = function() {
    openImageViewer(prototype.schematic);
};

    } else {

        schematic.removeAttribute("src");

        schematic.style.display = "none";

        noSchematic.style.display = "flex";

    }

    /* =========================
       PROTOTYPE PICTURES
    ========================= */

    const picturesContainer =
        document.getElementById("viewPictures");

    const noPictures =
        document.getElementById("viewNoPictures");

    picturesContainer.innerHTML = "";

    let pictures = [];

    if (prototype.pictures) {

        pictures = prototype.pictures
            .split(",")
            .map(function(image) {
                return image.trim();
            })
            .filter(Boolean);

    }

    if (pictures.length === 0) {

        picturesContainer.style.display = "none";

        noPictures.style.display = "block";

    } else {

        picturesContainer.style.display = "grid";

        noPictures.style.display = "none";

        pictures.forEach(function(imageURL, index) {

            const pictureItem =
                document.createElement("div");

            pictureItem.className =
                "view-picture-item";

            const image =
                document.createElement("img");

            image.src = imageURL;

            image.alt =
                "Prototype Picture " + (index + 1);

            pictureItem.appendChild(image);
            pictureItem.onclick = function() {
    openImageViewer(imageURL);
};

            picturesContainer.appendChild(pictureItem);

        });

    }

}

function setupShowMore(elementId) {
    const element = document.getElementById(elementId);

    if (!element) return;

    const oldButton = element.parentElement.querySelector(
        '.show-more-btn[data-for="' + elementId + '"]'
    );

    if (oldButton) oldButton.remove();

    element.classList.remove("collapsed");

    if (element.scrollHeight <= 120) return;

    element.classList.add("collapsed");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "show-more-btn";
    button.dataset.for = elementId;
    button.textContent = "Show More";

    button.onclick = function () {
        const isCollapsed = element.classList.toggle("collapsed");
        button.textContent = isCollapsed ? "Show More" : "Show Less";
    };

    element.insertAdjacentElement("afterend", button);
}

/* =========================
FULL SCREEN IMAGE VIEWER
========================= */

function openImageViewer(imageURL) {

    if (!imageURL) {
        return;
    }

    const viewer =
        document.getElementById("imageViewer");

    const viewerImage =
        document.getElementById("imageViewerImage");

    viewerImage.src = imageURL;

    viewer.style.display = "flex";

    document.body.style.overflow = "hidden";
}

function closeImageViewer() {

    const viewer =
        document.getElementById("imageViewer");

    const viewerImage =
        document.getElementById("imageViewerImage");

    viewer.style.display = "none";

    viewerImage.removeAttribute("src");

    document.body.style.overflow = "";
}

/* CLICK DARK BACKGROUND TO CLOSE */

document.getElementById("imageViewer")
    .addEventListener("click", function(event) {

        if (event.target === this) {
            closeImageViewer();
        }

    });

/* PRESS ESC TO CLOSE */

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        const viewer =
            document.getElementById("imageViewer");

        if (viewer.style.display === "flex") {
            closeImageViewer();
        }

    }

});
/* =========================
EDIT PROTOTYPE
========================= */
let deletedPictures = [];
let newEditPictures = [];
const MAX_PICTURES = 3;

function editPrototype(id) {

    const prototype = prototypes.find(function(item) {
        return item.id === id;
    });

    if (!prototype) {
        alert("Prototype not found.");
        return;
    }

    /* SAVE CURRENT EDIT DATA */

    currentEditID = prototype.id;
    currentEditData = prototype;

    /* RESET EDIT STATE */

    deletedPictures = [];
    newEditPictures = [];

    /* OPEN EDIT PAGE */

    hideSections();

    document.getElementById("editPrototype")
        .style.display = "block";

    /* LOAD EXISTING TEXT DATA */

    document.getElementById("editCourse").value =
        prototype.course || "";

    document.getElementById("editName").value =
        prototype.name || "";

    document.getElementById("editAcademicYear").value =
    prototype.academic_year || "";

    setRichTextValue("editDescription", prototype.description || "");
setRichTextValue("editPurpose", prototype.purpose || "");
setRichTextValue("editComponents", prototype.components || "");
setRichTextValue("editMembers", prototype.members || "");

    /* CLEAR OLD FILE SELECTIONS */

    document.getElementById("editSchematic").value = "";
    document.getElementById("editPictures").value = "";

    /* SHOW CURRENT SCHEMATIC */

        const currentSchematic =
        document.getElementById("editCurrentSchematic");

    if (currentSchematic) {

        if (prototype.schematic) {

            currentSchematic.src = prototype.schematic;
            currentSchematic.classList.add("is-visible");

        } else {

            currentSchematic.removeAttribute("src");
            currentSchematic.classList.remove("is-visible");

        }

    }

    /* SHOW CURRENT PICTURES WITH REMOVE BUTTONS */

    renderEditPictures();

}

function renderEditPictures() {

    const container =
        document.getElementById("editCurrentPictures");

    const noPictures =
        document.getElementById("editNoPictures");

    const limitText =
        document.getElementById("editPicturesLimitText");

    const addBtn =
        document.getElementById("editAddPictureBtn");

    container.innerHTML = "";

    /* SPLIT EXISTING PICTURES, EXCLUDING DELETED */

    let existing = [];

    if (currentEditData.pictures) {

        existing = currentEditData.pictures
            .split(",")
            .map(function(url) { return url.trim(); })
            .filter(Boolean)
            .filter(function(url) {
                return deletedPictures.indexOf(url) === -1;
            });

    }

    const total =
        existing.length + newEditPictures.length;

    /* EMPTY STATE */

    if (total === 0) {

        noPictures.style.display = "block";

    } else {

        noPictures.style.display = "none";

    }

    /* LIMIT TEXT */

    limitText.style.display =
        total === 0 ? "none" : "block";

    /* HIDE ADD BUTTON AT MAX */

    if (addBtn) {

        addBtn.style.display =
            total >= MAX_PICTURES ? "none" : "inline-block";

    }

    /* EXISTING PICTURES */

    existing.forEach(function(url) {

        container.appendChild(
            buildEditPictureItem(url, false)
        );

    });

    /* NEW (UNSAVED) PICTURES */

    newEditPictures.forEach(function(file, index) {

        const objectURL =
            URL.createObjectURL(file);

        container.appendChild(
            buildEditPictureItem(objectURL, true, index)
        );

    });

}

function buildEditPictureItem(src, isNew, index) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "edit-picture-item";

    const img =
        document.createElement("img");

    img.src = src;
    img.className = "edit-picture-img";

    const remove =
        document.createElement("button");

    remove.innerHTML = "×";
    remove.type = "button";
    remove.className = "edit-picture-remove";

    remove.onclick = function() {

        if (isNew) {

            newEditPictures.splice(index, 1);

        } else {

            deletedPictures.push(src);

        }

        renderEditPictures();

    };

    wrapper.appendChild(img);
    wrapper.appendChild(remove);

    return wrapper;

}

/* =========================
SAVE EDIT PROTOTYPE
========================= */

async function saveEditPrototype() {

    const oldSchematicURL = currentEditData.schematic;
    let schematicURL = oldSchematicURL;

    const oldPictures = [...deletedPictures];

    /* NEW SCHEMATIC */

    const schematicFile =
        document.getElementById("editSchematic").files[0];

    const prototypeName =
        document.getElementById("editName").value;

    if (schematicFile) {
        schematicURL = await uploadFile(
            schematicFile,
            "schematic",
            prototypeName
        );
    }

    /* KEEP PICTURES THAT WEREN'T DELETED */

    let keptPictures = [];

    if (currentEditData.pictures) {
        keptPictures = currentEditData.pictures
            .split(",")
            .map(function(url) {
                return url.trim();
            })
            .filter(Boolean)
            .filter(function(url) {
                return deletedPictures.indexOf(url) === -1;
            });
    }

    /* UPLOAD NEW PICTURES */

    let uploadedPictures = [];

    for (let i = 0; i < newEditPictures.length; i++) {
        const url = await uploadFile(
            newEditPictures[i],
            "pictures",
            prototypeName
        );

        if (url) {
            uploadedPictures.push(url);
        }
    }

    const picturesURL = keptPictures
        .concat(uploadedPictures)
        .join(",");

    /* UPDATE DATABASE FIRST */

    const updatedPrototype = {
    course: document.getElementById("editCourse").value,
    name: document.getElementById("editName").value,
    academic_year: document.getElementById("editAcademicYear").value.trim(),
    description: document.getElementById("editDescription").value,
    purpose: document.getElementById("editPurpose").value,
    components: document.getElementById("editComponents").value,
    members: document.getElementById("editMembers").value,
    schematic: schematicURL,
    pictures: picturesURL
};
    const { error } = await supabaseClient
        .from("prototypes")
        .update(updatedPrototype)
        .eq("id", currentEditID);

    if (error) {
        alert("Database update failed: " + error.message);
        return;
    }

    /* DELETE OLD PICTURES AFTER SUCCESSFUL UPDATE */

    let deletionErrors = [];

    for (const url of oldPictures) {
        try {
            await deleteFile(url);
        } catch (err) {
            console.error("Failed to delete old picture:", url, err);
            deletionErrors.push(url);
        }
    }

    /* DELETE OLD SCHEMATIC IF IT WAS REPLACED */

    if (schematicFile && oldSchematicURL) {
        try {
            await deleteFile(oldSchematicURL);
        } catch (err) {
            console.error("Failed to delete old schematic:", err);
            deletionErrors.push(oldSchematicURL);
        }
    }

    /* RESET STATE */

    deletedPictures = [];
    newEditPictures = [];

    await loadPrototypes();
    showCategory(updatedPrototype.course);

    if (deletionErrors.length > 0) {
        alert(
            "Changes saved, but some old files could not be deleted. " +
            "Check the console and Supabase Storage permissions."
        );
    } else {
        alert("Changes Saved Successfully!");
    }
}

/* =========================
DELETE PROTOTYPE
========================= */

async function deletePrototype(id) {

    const confirmDelete = confirm(
        "Delete this prototype?"
    );

    if (!confirmDelete) {
        return;
    }

    // Find prototype before deleting
    const prototype = prototypes.find(function(item) {
        return item.id === id;
    });

    if (!prototype) {
        alert("Prototype not found.");
        return;
    }

    // Remember category so we can refresh
    // the same category after deletion
    const deletedCategory = prototype.course;

    try {

        /* =========================
           DELETE SCHEMATIC FILE
        ========================= */

        if (prototype.schematic) {

            await deleteFile(prototype.schematic);

        }

        /* =========================
           DELETE PROTOTYPE PICTURES
        ========================= */

        if (prototype.pictures) {

            const images = prototype.pictures
                .split(",")
                .filter(Boolean);

            for (const imageUrl of images) {

                await deleteFile(imageUrl);

            }

        }

        /* =========================
           DELETE DATABASE RECORD
        ========================= */

        const { error } = await supabaseClient
            .from("prototypes")
            .delete()
            .eq("id", id);

        if (error) {

            alert(error.message);
            return;

        }

        /* =========================
           UPDATE LOCAL DATA
           IMMEDIATELY
        ========================= */

        prototypes = prototypes.filter(function(item) {

            return item.id !== id;

        });

        /* =========================
           REFRESH CURRENT CATEGORY
           WITHOUT PAGE REFRESH
        ========================= */

        showCategory(deletedCategory);

        alert("Deleted Successfully!");

    }

    catch (error) {

        console.error("Delete error:", error);

        alert(
            "Something went wrong while deleting the prototype."
        );

    }

}
/* =========================
INITIAL DISPLAY
========================= */

document.addEventListener(
"DOMContentLoaded",
function(){

document.querySelector(".sidebar").style.display = "none";

document.querySelector(".dashboard").style.display = "none";

document.getElementById("home").style.display = "none";

document.getElementById("addPrototype").style.display = "none";

document.getElementById("categories").style.display = "none";

document.getElementById("about").style.display = "none";

});

document.addEventListener(
"DOMContentLoaded",
function(){

const form =
document.getElementById("prototypeForm");
// =========================
// IMAGE PREVIEW
// =========================

const schematicInput =
document.getElementById("schematic");

const schematicPreview =
document.getElementById("schematicPreview");

const schematicUploadText =
document.getElementById("schematicUploadText");

if(schematicInput){

schematicInput.addEventListener(
"change",
function(){

schematicPreview.innerHTML="";

const file =
this.files[0];

if(file){

const img =
document.createElement("img");

img.src =
URL.createObjectURL(file);

img.style.width="100%";

img.style.height="220px";

img.style.objectFit="cover";
img.style.borderRadius="15px";
img.style.marginTop="15px";

schematicPreview.appendChild(img);

// HIDE "CLICK TO UPLOAD" TEXT
schematicUploadText.style.display = "none";

}else{

// SHOW AGAIN IF NOTHING SELECTED
schematicUploadText.style.display = "block";

}

}

);

}

const pictureInput =
document.getElementById("prototypePictures");

const picturesPreview =
document.getElementById("picturesPreview");

const picturesUploadText =
document.getElementById("picturesUploadText");

const addPictureBtn =
document.getElementById("addPictureBtn");

const MAX_PICTURES = 3;

let selectedPictures = [];

function renderPicturePreviews(){

    picturesPreview.innerHTML = "";

    // HIDE "CLICK TO UPLOAD" WHEN THERE ARE PICTURES
        // HIDE "CLICK TO UPLOAD" WHEN THERE ARE PICTURES
    if(selectedPictures.length === 0){

        picturesUploadText.style.display = "block";

    }else{

        picturesUploadText.style.display = "none";

    }

    // HIDE "+ ADD PICTURE" WHEN MAX IS REACHED
    if(selectedPictures.length >= MAX_PICTURES){

        addPictureBtn.style.display = "none";

    }else{

        addPictureBtn.style.display = "inline-block";

    }

    if(selectedPictures.length === 0){

        return;

    }

    selectedPictures.forEach(function(file, index){

        const wrapper =
            document.createElement("div");

        wrapper.style.display =
            "inline-block";

        wrapper.style.position =
            "relative";

        wrapper.style.margin =
            "10px";

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.width =
            "180px";

        img.style.height =
            "140px";

        img.style.objectFit =
            "cover";

        img.style.borderRadius =
            "12px";

        const remove =
            document.createElement("button");

        remove.innerHTML =
            "×";

        remove.type =
            "button";

        remove.style.position =
            "absolute";

        remove.style.top =
            "5px";

        remove.style.right =
            "5px";

        // REBUILD SO INDEXES STAY CORRECT
        remove.onclick =
            function(){

                selectedPictures.splice(
                    index,
                    1
                );

                renderPicturePreviews();

            };

        wrapper.appendChild(img);

        wrapper.appendChild(remove);

        picturesPreview.appendChild(wrapper);

    });

}

if(pictureInput){

    pictureInput.addEventListener(
        "change",
        function(){

            const newFiles =
                Array.from(this.files);

                        if(selectedPictures.length + newFiles.length > MAX_PICTURES){

                alert(
                    "Maximum of 3 pictures only."
                );

                return;

            }

            selectedPictures =
                selectedPictures.concat(newFiles);

            renderPicturePreviews();

            

        }

    );

}

const editPicturesInput =
    document.getElementById("editPictures");

if (editPicturesInput) {

    editPicturesInput.addEventListener("change", function() {

        const newFiles =
            Array.from(this.files);

        const existingCount =
            (currentEditData && currentEditData.pictures)
                ? currentEditData.pictures
                    .split(",")
                    .filter(Boolean)
                    .filter(function(url) {
                        return deletedPictures.indexOf(url) === -1;
                    }).length
                : 0;

        const total =
            existingCount +
            newEditPictures.length +
            newFiles.length;

        if (total > MAX_PICTURES) {

            alert("Maximum of 3 pictures only.");
            this.value = "";
            return;

        }

        newEditPictures =
            newEditPictures.concat(newFiles);

        this.value = "";

        renderEditPictures();

    });

}

if(form){

form.addEventListener(
"submit",
async function(e){

e.preventDefault();

const requiredRichFields = [
    "prototypeDescription",
    "prototypePurpose",
    "prototypeComponents",
    "prototypeMembers"
];

for (const id of requiredRichFields) {
    const editor = document.getElementById(id);

    if (!editor || !editor.textContent.trim()) {
        alert("Please fill in all text fields before saving.");

        if (editor) editor.focus();

        return;
    }
}

const schematicFile =
document.getElementById("schematic")
.files[0];

const pictureFiles = selectedPictures;

if(pictureFiles.length === 0){

    alert(
        "Please upload at least 1 prototype picture."
    );

    return;

}

if(pictureFiles.length > 3){

    alert(
        "Maximum of 3 prototype pictures only."
    );

    return;

}

const newPrototype = {
    name: document.getElementById("prototypeName").value,
    course: document.getElementById("prototypeCourse").value,
    academic_year: document.getElementById("prototypeAcademicYear").value.trim(),
    description: getRichTextValue("prototypeDescription"),
    purpose: getRichTextValue("prototypePurpose"),
    components: getRichTextValue("prototypeComponents"),
    members: getRichTextValue("prototypeMembers"),
    schematic: null,
    pictures: ""
};

/* SAVE FIRST TO GET THE PROTOTYPE ID */
const { data: createdPrototype, error: insertError } =
    await supabaseClient
        .from("prototypes")
        .insert([newPrototype])
        .select()
        .single();

if (insertError) {
    alert(insertError.message);
    return;
}

/* UPLOAD SCHEMATIC USING THE PROTOTYPE ID */
let schematicURL = null;

if (schematicFile) {
   schematicURL = await uploadFile(
    schematicFile,
    "schematic",
    String(createdPrototype.id)
);
}

/* UPLOAD PICTURES USING THE SAME PROTOTYPE ID */
let picturesURL = [];

for (let i = 0; i < pictureFiles.length; i++) {
   const url = await uploadFile(
    pictureFiles[i],
    "pictures",
    String(createdPrototype.id)
);
    if (url) {
        picturesURL.push(url);
    }
}

/* SAVE THE FILE URLS TO THE DATABASE */
const { error: updateError } = await supabaseClient
    .from("prototypes")
    .update({
        schematic: schematicURL,
        pictures: picturesURL.join(",")
    })
    .eq("id", createdPrototype.id);

if (updateError) {
    alert(updateError.message);
    return;
}

alert("Prototype Saved!");

form.reset();

richTextEditorIDs.slice(0, 4).forEach(function(id) {
    setRichTextValue(id, "");
});

selectedPictures = [];

document.getElementById("schematicPreview").innerHTML = "";

schematicUploadText.style.display = "block";

renderPicturePreviews();

await loadPrototypes();

showCategory(newPrototype.course);

}

);

}

});

// =========================
// RICH TEXT EDITOR
// =========================

const richTextEditorIDs = [
    "prototypeDescription",
    "prototypePurpose",
    "prototypeComponents",
    "prototypeMembers",
    "editDescription",
    "editPurpose",
    "editComponents",
    "editMembers"
];

function sanitizeRichHtml(value) {
    if (!value) return "";

    const original = String(value);

    const hasHtml =
        /<\/?(p|div|br|b|strong|i|em|u|ul|ol|li|span)\b/i.test(original);

    const source = hasHtml
        ? original
        : original
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\r?\n/g, "<br>");

    const doc = new DOMParser().parseFromString(source, "text/html");

    const allowedTags = [
        "P", "DIV", "BR", "B", "STRONG", "I", "EM",
        "U", "UL", "OL", "LI", "SPAN"
    ];

    function clean(parent) {
        Array.from(parent.childNodes).forEach(function(node) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                if (node.nodeType !== Node.TEXT_NODE) node.remove();
                return;
            }

            if (!allowedTags.includes(node.tagName)) {
                node.replaceWith(doc.createTextNode(node.textContent));
                return;
            }

            const oldStyle = node.getAttribute("style") || "";

            const align = oldStyle.match(
                /text-align\s*:\s*(left|right|center|justify)/i
            );

            const spacing = oldStyle.match(
                /line-height\s*:\s*(1(?:\.0)?|1\.15|1\.5|2(?:\.0)?)/i
            );

            const listType = oldStyle.match(
    /list-style-type\s*:\s*(upper-alpha|lower-alpha|decimal|disc|circle|square)/i
);
            
            

            node.removeAttribute("style");
            Array.from(node.attributes).forEach(function(attr) {
                node.removeAttribute(attr.name);
            });

            const styles = [];

            if (align) styles.push("text-align: " + align[1].toLowerCase());
            if (spacing) styles.push("line-height: " + spacing[1]);
            if (listType && node.tagName === "OL") {
    styles.push("list-style-type: " + listType[1].toLowerCase());
}

            if (styles.length) {
                node.setAttribute("style", styles.join("; "));
            }

            clean(node);
        });
    }

    clean(doc.body);
    return doc.body.innerHTML;
}

function setRichTextValue(id, value) {
    const editor = document.getElementById(id);
    if (!editor) return;

    editor.innerHTML = sanitizeRichHtml(value);
}

function getRichTextValue(id) {
    const editor = document.getElementById(id);
    if (!editor) return "";

    return sanitizeRichHtml(editor.innerHTML);
}

function setupRichTextEditor(id) {
    const editor = document.getElementById(id);

    if (!editor || editor.dataset.richReady === "true") return;

    const toolbar = document.createElement("div");
    toolbar.className = "rich-text-toolbar";

    
const commands = [
    ["<b>B</b>", "Bold", "bold"],
    ["<i>I</i>", "Italic", "italic"],
    ["<u>U</u>", "Underline", "underline"],
    [
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 6h16M4 10h10M4 14h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        "Align left", "justifyLeft"
    ],
    [
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 6h16M7 10h10M4 14h16M7 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        "Align center", "justifyCenter"
    ],
    [
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 6h16M10 10h10M4 14h16M10 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        "Align right", "justifyRight"
    ],
    [
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        "Justify text", "justifyFull"
    ],
    ["•", "Bulleted list", "insertUnorderedList"],
    ["1.", "Numbered list", "insertOrderedList"],
    ["ABC", "Uppercase alphabetic list", "insertUpperAlphaList"],
    ["abc", "Lowercase alphabetic list", "insertLowerAlphaList"]
];

commands.forEach(function(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = item[0];
    button.title = item[1];
    button.setAttribute("aria-label", item[1]);

    if (item[2] === "bold") button.style.fontWeight = "bold";
    if (item[2] === "italic") button.style.fontStyle = "italic";
    if (item[2] === "underline") {
        button.style.textDecoration = "underline";
    }

    button.addEventListener("mousedown", function(event) {
        event.preventDefault();
    });

    button.addEventListener("click", function() {
        editor.focus();

        if (
            item[2] === "insertUpperAlphaList" ||
            item[2] === "insertLowerAlphaList"
        ) {
            document.execCommand("insertOrderedList", false, null);

            const lists = editor.querySelectorAll("ol");
            const list = lists[lists.length - 1];

            if (list) {
                list.style.listStyleType =
                    item[2] === "insertUpperAlphaList"
                        ? "upper-alpha"
                        : "lower-alpha";
            }
        } else {
            document.execCommand(item[2], false, null);
        }
    });

    toolbar.appendChild(button);
});

    const spacing = document.createElement("select");
    spacing.title = "Line spacing";

    [
        ["1.0", "1"],
        ["1.15", "1.15"],
        ["1.5", "1.5"],
        ["2.0", "2"]
    ].forEach(function(item) {
        const option = document.createElement("option");
        option.textContent = "Line spacing " + item[0];
        option.value = item[1];
        spacing.appendChild(option);
    });

    spacing.value = "1.5";

    spacing.addEventListener("change", function() {
        editor.focus();

        let blocks = editor.querySelectorAll("p, div, li");

        if (blocks.length === 0 && editor.textContent.trim()) {
            const paragraph = document.createElement("p");

            while (editor.firstChild) {
                paragraph.appendChild(editor.firstChild);
            }

            editor.appendChild(paragraph);
            blocks = editor.querySelectorAll("p, div, li");
        }

        blocks.forEach(function(block) {
            block.style.lineHeight = spacing.value;
        });

        editor.style.lineHeight = spacing.value;
    });

    toolbar.appendChild(spacing);
    editor.parentNode.insertBefore(toolbar, editor);

    editor.dataset.richReady = "true";
}

document.addEventListener("DOMContentLoaded", function() {
    richTextEditorIDs.forEach(setupRichTextEditor);
});
