document.addEventListener('DOMContentLoaded', () => {
    const languageSelectionScreen = document.getElementById('language-selection-screen');
    const langEnButton = document.getElementById('lang-en');
    const langSkButton = document.getElementById('lang-sk');

    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const playButton = document.getElementById('play-button');
    const difficultySelectionScreen = document.getElementById('difficulty-selection-screen');
    const startGameButton = document.getElementById('start-game-button');
    const difficultySelect = document.getElementById('difficulty');
    const tutorialScreen = document.getElementById('tutorial-screen');
    const closeTutorialButton = document.getElementById('close-tutorial-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const winScreen = document.getElementById('win-screen');
    const deathReasonElement = document.getElementById('death-reason');

    if (winScreen && !document.getElementById('win-credits')) {
        const winCredits = document.createElement('div');
        winCredits.id = 'win-credits';
        winCredits.innerHTML = `
            <div>Code: Program Trae with AI</div>
            <div>Game Idea: F.Š.</div>
            <div>Frog Sounds: S.L.</div>
        `;
        winScreen.appendChild(winCredits);
    }
    let difficultyMultiplier = 1;
    let currentLanguage = 'en'; // Default language
    let coins = 10; // Initial coins
    let level = 1; // Initial level
    let timeToNextLevelCounter = 60; // Seconds until next level
    let gameInterval;
    let poopSpawnInterval;
    let levelInterval;
    const coinDisplay = document.getElementById('coin-display');
    const levelDisplay = document.getElementById('level-display');
    const coinAmountElement = document.getElementById('coin-amount');
    const levelAmountElement = document.getElementById('level-amount');
    const timeToNextLevelAmountElement = document.getElementById('time-to-next-level-amount');

    // Audio elements
    const furnaceSound = new Audio('furnace.mp3');
    const windowSound = new Audio('window.mp3');
    const eatingSound = new Audio('eating.mp3');
    let isAudioPrimed = false;

    function playSound(audio) {
        try {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        } catch {
        }
    }

    function primeAudio() {
        if (isAudioPrimed) {
            return;
        }

        isAudioPrimed = true;

        [furnaceSound, windowSound, eatingSound].forEach((audio) => {
            audio.preload = 'auto';
            audio.load();
        });

        [furnaceSound, windowSound, eatingSound].forEach((audio) => {
            const previousVolume = audio.volume;
            audio.volume = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = previousVolume;
                    })
                    .catch(() => {
                        audio.volume = previousVolume;
                    });
            } else {
                audio.volume = previousVolume;
            }
        });
    }

    // Translation data structure
    const translations = {
        en: {
            chooseLanguage: "Choose Your Language",
            english: "English",
            slovak: "Slovak",
            froggyFate: "Froggy's Fate",
            play: "Play",
            chooseDifficulty: "Choose Difficulty",
            selectDifficulty: "Select Difficulty:",
            peaceful: "Peaceful",
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            hardcore: "Hardcore",
            startGame: "Start Game",
            welcomeToFroggyFate: "Welcome to Froggy's Fate!",
            froggysNeeds: "Froggy's Needs:",
            fullness: "Fullness:",
            cleanliness: "Cleanliness:",
            happiness: "Happiness:",
            sleep: "Sleep:",
            oxygen: "Oxygen:",
            temperature: "Temperature:",
            feedFroggy: "Feed your froggy flies from the jar in the kitchen. Drag the fly jar to the frog.",
            cleanPoop: "Clean up poop when it appears. Click on the poop to remove it. You can also wash your froggy in the bathroom.",
            playWithFroggy: "Play with your froggy using the ball in the playroom. Drag the ball to the frog.",
            letFroggySleep: "Let your froggy rest in the bedroom. Click the bed to make it sleep.",
            openWindow: "Open the window to let in fresh air. Click the window to open/close it.",
            adjustFurnace: "Adjust the furnace to keep your froggy warm. Click the furnace to increase the temperature.",
            gameOverTitle: "Game Over:",
            gameOverText: "The game ends if any of your froggy's stats drop to zero, or if the temperature gets too cold (below -10°C) or too hot (above 35°C).",
            goodLuck: "Good luck, and have fun!",
            gotIt: "Got It!",
            kitchen: "Kitchen",
            bathroom: "Bathroom",
            bedroom: "Bedroom",
            playroom: "Playroom",
            wash: "Wash",
            playMinigame: "Play Minigame",
            sleep: "Sleep",
            gameOver: "Game Over!",
            froggyPassedAway: "Your froggy has passed away.",
            refreshToPlayAgain: "Refresh the page to play again.",
            deathStarved: "Your froggy starved to death!",
            deathFilth: "Your froggy succumbed to filth!",
            deathSadness: "Your froggy died of sadness!",
            deathTired: "Your froggy was too tired to live!",
            deathOxygen: "Your froggy ran out of oxygen!",
            deathFrozen: "Your froggy froze to death!",
            deathOverheated: "Your froggy overheated!",
            notEnoughCoins: "Not enough coins!",
            coinsTutorialTitle: "Coins:",
            coinsEarn: "Earn coins by working in the 'Job' room. Click the 'Work' button to earn 10 coins.",
            coinsSpendFood: "Spend 1 coin to feed your froggy. Drag the fly jar to the frog.",
            coinsSpendFurnace: "Spend 1 coin to increase the temperature using the furnace.",
            level: "Level:",
            winTitle: "You Win!",
            winMessage: "Congratulations! Your froggy reached level 5 and lived a long, happy life!",
            timeToNextLevel: "Time to next level:",
            deathBurned: "Really? Why would you do that? Did that frog do anything to you for you to throw it in the furnace and let it burn to ash? You murderer!",
            deathWindowThrown: "Really? I know that the frog needs air to breathe, but you do not need to throw it out of the window... You murderer!",
        },
        sk: {
            chooseLanguage: "Vyberte si jazyk",
            english: "Angličtina",
            slovak: "Slovenčina",
            froggyFate: "Žabkin Osud",
            play: "Hrať",
            chooseDifficulty: "Vyberte Obtiažnosť",
            selectDifficulty: "Vyberte obtiažnosť:",
            peaceful: "Pokojná",
            easy: "Ľahká",
            medium: "Stredná",
            hard: "Ťažká",
            hardcore: "Hardcore",
            startGame: "Spustiť Hru",
            welcomeToFroggyFate: "Vitajte v hre Žabkin Osud!",
            froggysNeeds: "Potreby Žabky:",
            fullness: "Sýtosť:",
            cleanliness: "Čistota:",
            happiness: "Šťastie:",
            sleep: "Spánok:",
            oxygen: "Kyslík:",
            temperature: "Teplota:",
            feedFroggy: "Nakŕmte žabku jedlom v kuchyni. Pretiahnite pohár s muchami k žabke.",
            cleanPoop: "Vyčistite výkaly, keď sa objavia. Kliknite na výkaly, aby ste ich odstránili. Žabku môžete tiež umyť v kúpeľni.",
            playWithFroggy: "Hrajte sa so žabkou pomocou loptičky v herni. Pretiahnite loptičku k žabke.",
            letFroggySleep: "Nechajte žabku odpočívať v spálni. Kliknite na posteľ, aby spala.",
            openWindow: "Otvorte okno, aby ste vpustili čerstvý vzduch. Kliknite na okno, aby ste ho otvorili/zatvorili.",
            adjustFurnace: "Nastavte pec, aby bola žabka v teple. Kliknite na pec, aby ste zvýšili teplotu.",
            gameOverTitle: "Koniec Hry:",
            gameOverText: "Hra končí, ak niektorá zo štatistík vašej žabky klesne na nulu, alebo ak teplota klesne príliš nízko (pod -10°C) alebo stúpne príliš vysoko (nad 35°C).",
            goodLuck: "Veľa šťastia a zabavte sa!",
            gotIt: "Rozumiem!",
            kitchen: "Kuchyňa",
            bathroom: "Kúpeľňa",
            bedroom: "Spálňa",
            playroom: "Herňa",
            wash: "Umyť",
            playMinigame: "Zabaviť sa hrou",
            sleep: "Spať",
            gameOver: "Koniec Hry!",
            froggyPassedAway: "Vaša žabka zomrela.",
            refreshToPlayAgain: "Obnovte stránku pre opätovné hranie.",
            deathStarved: "Vaša žabka zomrela od hladu!",
            deathFilth: "Vaša žabka podľahla špine!",
            deathSadness: "Vaša žabka zomrela od smútku!",
            deathTired: "Vaša žabka bola príliš unavená na život!",
            deathOxygen: "Vašej žabke došiel kyslík!",
            deathFrozen: "Vaša žabka zamrzla!",
            deathOverheated: "Vaša žabka sa prehriala!",
            notEnoughCoins: "Nedostatok mincí!",
            job: "Práca",
            work: "Pracovať" ,
            coinsTutorialTitle: "Mince:",
            coinsEarn: "Získajte mince prácou v miestnosti 'Práca'. Kliknutím na tlačidlo 'Práca' získate 10 mincí.",
            coinsSpendFood: "Miňte 1 mincu na kŕmenie žabky. Pretiahnite pohár s muchami k žabke.",
            coinsSpendFurnace: "Miňte 1 mincu na zvýšenie teploty pomocou pece.",
            level: "Úroveň:",
            winTitle: "Vyhrali ste!",
            winMessage: "Gratulujeme! Vaša žabka dosiahla úroveň 5 a prežila dlhý, šťastný život!",
            timeToNextLevel: "Čas do ďalšej úrovne:",
            deathBurned: "Naozaj? Prečo by si to urobil? Urobila ti tá žabka niečo, že si ju musel hodiť do pece a nechať ju zhorieť na popol? Ty vrah!",
            deathWindowThrown: "Naozaj? Prečo si to urobil? Viem, že žabka potrebuje vzduch na dýchanie, ale nemusíš ju vyhadzovať z okna... Ty vrah!",
        }
    };

    function applyLanguage(lang) {
        currentLanguage = lang;
        // Update elements with data-translate-key attribute
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Update specific elements that don't have data-translate-key or need special handling
        // This will be expanded in later steps
    }

    // Initially hide welcome screen and show language selection
    welcomeScreen.classList.add('hidden');
    languageSelectionScreen.classList.remove('hidden');

    langEnButton.addEventListener('click', () => {
        applyLanguage('en');
        languageSelectionScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });

    langSkButton.addEventListener('click', () => {
        applyLanguage('sk');
        languageSelectionScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });

    // Room elements
    const roomDisplay = document.getElementById('room-display');
    const kitchenRoom = document.getElementById('kitchen-room');
    const bathroomRoom = document.getElementById('bathroom-room');
    const bedroomRoom = document.getElementById('bedroom-room');
    const playroomRoom = document.getElementById('playroom-room');
    const jobRoom = document.getElementById('job-room');

    // Room navigation buttons
    const goToKitchenButton = document.getElementById('go-to-kitchen');
    const goToBathroomButton = document.getElementById('go-to-bathroom');
    const goToBedroomButton = document.getElementById('go-to-bedroom');
    const goToPlayroomButton = document.getElementById('go-to-playroom');
    const goToJobButton = document.getElementById('go-to-job');

    // Action buttons
    const washButton = bathroomRoom.querySelector('#wash-button');
    const playMinigameButton = playroomRoom.querySelector('#play-button-game');
    const sleepButton = bedroomRoom.querySelector('#sleep-button');
    const workButton = jobRoom.querySelector('#work-button');


    // Interactive items
    const foodItem = document.getElementById('food-item');
    const poopItem = document.getElementById('poop-item');
    const frogContainer = document.getElementById('frog-container');
    const frogBody = document.getElementById('frog-body');
    const frogMouth = document.getElementById('frog-mouth');
    const windowItem = document.getElementById('window-item');
    const furnaceItem = document.getElementById('furnace-item');
    const interactiveElementsContainer = document.getElementById('interactive-elements-container');
    const verticalStatsContainer = document.getElementById('vertical-stats-container');

    let currentRoom = 'kitchen'; // Initial room

    // Eye elements
    const eyeLeft = document.getElementById('eye-left');
    const eyeRight = document.getElementById('eye-right');
    const pupilLeft = eyeLeft.querySelector('.pupil');
    const pupilRight = eyeRight.querySelector('.pupil');
    let isFrogPickedUp = false;
    let frogPickupScale = 1;

    // Frog attributes
    let fullness = 100;
    let cleanliness = 100;
    let happiness = 100;
    let sleep = 100;
    let oxygen = 100; // New oxygen stat
    let temperature = 20; // New temperature stat (Celsius)


    // Get stat elements
    const fullnessFill = document.getElementById('hunger-fill');
    const cleanlinessFill = document.getElementById('cleanliness-fill');
    const happinessFill = document.getElementById('happiness-fill');
    const sleepFill = document.getElementById('sleep-fill');
    const oxygenFill = document.getElementById('oxygen-fill'); // New oxygen stat fill element
    const temperatureFill = document.getElementById('temperature-fill'); // New temperature stat fill element


    // Get percentage display elements
    const fullnessPercentage = document.getElementById('hunger-percentage');
    const cleanlinessPercentage = document.getElementById('cleanliness-percentage');
    const happinessPercentage = document.getElementById('happiness-percentage');
    const sleepPercentage = document.getElementById('sleep-percentage');
    const oxygenPercentage = document.getElementById('oxygen-percentage');
    const temperaturePercentage = document.getElementById('temperature-percentage');

    // Function to update the display of stats
    function updateStatsDisplay() {
        fullnessFill.style.width = `${fullness}%`;
        cleanlinessFill.style.width = `${cleanliness}%`;
        happinessFill.style.width = `${happiness}%`;
        sleepFill.style.width = `${sleep}%`;
        oxygenFill.style.height = `${oxygen}%`; // Vertical bar
        temperatureFill.style.height = `${(temperature + 10) * 100 / 50}%`; // Scale -10 to 40 to 0-100%

        fullnessPercentage.textContent = `${fullness}%`;
        cleanlinessPercentage.textContent = `${cleanliness}%`;
        happinessPercentage.textContent = `${happiness}%`;
        sleepPercentage.textContent = `${sleep}%`;
        oxygenPercentage.textContent = `${oxygen}%`;
        temperaturePercentage.textContent = `${temperature}°C`;
    }

    function updateCoinDisplay() {
        coinAmountElement.textContent = coins;
    }

    function updateLevelDisplay() {
        levelAmountElement.textContent = level;
        timeToNextLevelAmountElement.textContent = timeToNextLevelCounter;
    }

    function showRoom(roomToShow) {
        const allRooms = [kitchenRoom, bathroomRoom, bedroomRoom, playroomRoom, jobRoom];
        allRooms.forEach(room => {
            room.classList.add('hidden');
        });
        roomToShow.classList.remove('hidden');
        currentRoom = roomToShow.id.replace('-room', ''); // Update currentRoom variable
    }

    playButton.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        difficultySelectionScreen.classList.remove('hidden');
    });



    let isDragging = false;
    let offsetX, offsetY;
    let poopPresent = false; // Track if poop is currently on screen
    let specialLossTimeout;
    let activeFrogPointerId = null;
    let activeFoodPointerId = null;
    let isFoodPointerDragging = false;
    let foodPointerOffsetX = 0;
    let foodPointerOffsetY = 0;

    function updatePickedUpFrogPosition(clientX, clientY) {
        frogContainer.style.left = `${clientX}px`;
        frogContainer.style.top = `${clientY}px`;
    }

    function startFrogPickup(clientX, clientY) {
        isFrogPickedUp = true;

        const furnaceRect = furnaceItem.getBoundingClientRect();
        const frogRect = frogContainer.getBoundingClientRect();
        frogPickupScale = Math.min(furnaceRect.width / frogRect.width, furnaceRect.height / frogRect.height);

        frogContainer.classList.add('frog-picked-up');
        frogContainer.style.transform = `translate(-50%, -50%) scale(${frogPickupScale})`;
        document.body.classList.add('frog-dragging');
        updatePickedUpFrogPosition(clientX, clientY);
    }

    function pickUpFrog(event) {
        if (event.button !== 0 || gameScreen.classList.contains('hidden') || specialLossTimeout) {
            return;
        }

        event.preventDefault();
        startFrogPickup(event.clientX, event.clientY);
    }

    function isOverlapping(elementA, elementB) {
        const rectA = elementA.getBoundingClientRect();
        const rectB = elementB.getBoundingClientRect();

        return (
            rectA.left < rectB.right &&
            rectA.right > rectB.left &&
            rectA.top < rectB.bottom &&
            rectA.bottom > rectB.top
        );
    }

    function triggerGameOver(deathReason) {
        clearInterval(gameInterval); // Stop the game loop
        clearInterval(poopSpawnInterval);
        clearInterval(levelInterval); // Clear level interval on game over
        clearTimeout(specialLossTimeout);
        specialLossTimeout = null;
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
        deathReasonElement.textContent = deathReason; // Display the reason
        frogBody.classList.add('frog-dead'); // Apply death animation
        disableGameInteractions();
    }

    function triggerSpecialLoss(reasonKey, cause) {
        if (specialLossTimeout) {
            return;
        }

        releaseFrog();
        clearInterval(gameInterval);
        clearInterval(poopSpawnInterval);
        clearInterval(levelInterval);
        disableGameInteractions();
        frogContainer.style.visibility = 'hidden';

        if (cause === 'furnace') {
            furnaceItem.classList.add('furnace-burning');
            playSound(furnaceSound);
        } else if (cause === 'window') {
            playSound(windowSound);
        }

        specialLossTimeout = setTimeout(() => {
            triggerGameOver(translations[currentLanguage][reasonKey]);
        }, 5000);
    }

    function releaseFrog() {
        if (!isFrogPickedUp) {
            return;
        }

        const droppedInFurnace = isOverlapping(frogContainer, furnaceItem);
        const droppedOutWindow = isOverlapping(frogContainer, windowItem);

        isFrogPickedUp = false;
        frogContainer.classList.remove('frog-picked-up');
        frogContainer.style.left = '';
        frogContainer.style.top = '';
        frogContainer.style.transform = '';
        document.body.classList.remove('frog-dragging');

        if (droppedInFurnace) {
            triggerSpecialLoss('deathBurned', 'furnace');
            return;
        }

        if (droppedOutWindow) {
            triggerSpecialLoss('deathWindowThrown', 'window');
        }
    }

    function cleanPoop() {
        if (poopPresent) {
            poopItem.classList.add('hidden');
            poopItem.style.display = 'none';
            poopPresent = false;
            cleanliness = Math.min(100, cleanliness + 20); // Increase cleanliness when poop is cleaned
            happiness = Math.min(100, happiness + 5); // Small happiness boost
            updateStatsDisplay();
        }
    }

    poopItem.addEventListener('click', cleanPoop);
    frogContainer.addEventListener('mousedown', pickUpFrog);
    frogContainer.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' || gameScreen.classList.contains('hidden') || specialLossTimeout) {
            return;
        }

        event.preventDefault();
        activeFrogPointerId = event.pointerId;
        frogContainer.setPointerCapture(event.pointerId);
        startFrogPickup(event.clientX, event.clientY);
    });

    frogContainer.addEventListener('pointermove', (event) => {
        if (activeFrogPointerId === event.pointerId && isFrogPickedUp) {
            updatePickedUpFrogPosition(event.clientX, event.clientY);
        }
    });

    frogContainer.addEventListener('pointerup', (event) => {
        if (activeFrogPointerId === event.pointerId) {
            activeFrogPointerId = null;
            releaseFrog();
        }
    });

    frogContainer.addEventListener('pointercancel', (event) => {
        if (activeFrogPointerId === event.pointerId) {
            activeFrogPointerId = null;
            releaseFrog();
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (isFrogPickedUp) {
            updatePickedUpFrogPosition(event.clientX, event.clientY);
        }
    });

    document.addEventListener('mouseup', releaseFrog);

    function updateFoodPosition(clientX, clientY) {
        foodItem.style.left = `${clientX - foodPointerOffsetX}px`;
        foodItem.style.top = `${clientY - foodPointerOffsetY}px`;
        foodItem.style.position = 'fixed';
        foodItem.style.transform = '';

        if (isNearMouth(foodItem, frogMouth)) {
            frogMouth.classList.add('mouth-open');
        } else {
            frogMouth.classList.remove('mouth-open');
        }
    }

    function endFoodPointerDrag() {
        if (!isFoodPointerDragging) {
            return;
        }

        isFoodPointerDragging = false;
        activeFoodPointerId = null;
        document.body.classList.remove('food-dragging');
        foodItem.style.cursor = 'grab';
        frogMouth.classList.remove('mouth-open');

        if (isNearMouth(foodItem, frogMouth)) {
            if (coins >= 1) {
                foodItem.style.display = 'none';
                frogMouth.classList.add('chewing');
                playSound(eatingSound);
                feedFrog();

                setTimeout(() => {
                    frogMouth.classList.remove('chewing');
                    foodItem.style.display = 'block';
                    foodItem.style.position = 'absolute';
                    foodItem.style.left = '50%';
                    foodItem.style.top = '';
                    foodItem.style.transform = 'translateX(-50%)';
                }, 2000);
            } else {
                alert(translations[currentLanguage].notEnoughCoins);
                foodItem.style.position = 'absolute';
                foodItem.style.left = '50%';
                foodItem.style.top = '';
                foodItem.style.transform = 'translateX(-50%)';
            }
        } else {
            foodItem.style.position = 'absolute';
            foodItem.style.left = '50%';
            foodItem.style.top = '';
            foodItem.style.transform = 'translateX(-50%)';
        }
    }

    function spawnPoop() {
        if (!poopPresent) {
            const gameScreenRect = gameScreen.getBoundingClientRect();
            const poopSize = 30; // Based on CSS
            const maxX = gameScreenRect.width - poopSize;
            const maxY = gameScreenRect.height - poopSize;

            // Random position within the game screen, avoiding the frog container
            // For simplicity, let's just avoid the center area for now
            const frogContainer = document.getElementById('frog-container');
            const frogRect = frogContainer.getBoundingClientRect();

            let randomX, randomY;
            let collision = true;

            while(collision) {
                randomX = Math.random() * maxX;
                randomY = Math.random() * maxY;

                // Check if the random position overlaps with the frog container
                if (
                    randomX < frogRect.left - gameScreenRect.left || randomX > frogRect.right - gameScreenRect.left ||
                    randomY < frogRect.top - gameScreenRect.top || randomY > frogRect.bottom - gameScreenRect.top
                ) {
                    collision = false;
                }
            }

            poopItem.style.left = `${randomX}px`;
            poopItem.style.top = `${randomY}px`;
            poopItem.classList.remove('hidden');
            poopItem.style.display = 'block';
            poopPresent = true;
        }
    }

    // Periodically spawn poop (e.g., every 30-60 seconds)
    setInterval(() => {
        const chance = Math.random();
        if (chance < 0.5) { // 50% chance to spawn poop
            spawnPoop();
        }
    }, 45000); // Check every 45 seconds

    foodItem.addEventListener('dragstart', (e) => {
        isDragging = true;
        // Store the initial mouse position relative to the food item
        offsetX = e.clientX - foodItem.getBoundingClientRect().left;
        offsetY = e.clientY - foodItem.getBoundingClientRect().top;
        // Set drag image to be transparent or a custom image
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        foodItem.style.cursor = 'grabbing';
    });

    foodItem.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' || gameScreen.classList.contains('hidden') || specialLossTimeout) {
            return;
        }

        event.preventDefault();
        isFoodPointerDragging = true;
        activeFoodPointerId = event.pointerId;
        foodItem.setPointerCapture(event.pointerId);
        document.body.classList.add('food-dragging');

        const rect = foodItem.getBoundingClientRect();
        foodPointerOffsetX = event.clientX - rect.left;
        foodPointerOffsetY = event.clientY - rect.top;
        updateFoodPosition(event.clientX, event.clientY);
    });

    foodItem.addEventListener('pointermove', (event) => {
        if (activeFoodPointerId === event.pointerId && isFoodPointerDragging) {
            updateFoodPosition(event.clientX, event.clientY);
        }
    });

    foodItem.addEventListener('pointerup', (event) => {
        if (activeFoodPointerId === event.pointerId) {
            endFoodPointerDrag();
        }
    });

    foodItem.addEventListener('pointercancel', (event) => {
        if (activeFoodPointerId === event.pointerId) {
            endFoodPointerDrag();
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow dropping
    });

    document.addEventListener('drag', (e) => {
        if (isDragging) {
            // Update food item position based on mouse cursor
            foodItem.style.left = `${e.clientX - offsetX}px`;
            foodItem.style.top = `${e.clientY - offsetY}px`;
            foodItem.style.position = 'fixed'; // Ensure it moves with the cursor

            if (isNearMouth(foodItem, frogMouth)) {
                frogMouth.classList.add('mouth-open');
            } else {
                frogMouth.classList.remove('mouth-open');
            }
        }
    });

    document.addEventListener('dragend', (e) => {
        isDragging = false;
        foodItem.style.cursor = 'grab';
        frogMouth.classList.remove('mouth-open'); // Close mouth if food is released

        if (isNearMouth(foodItem, frogMouth)) {
            if (coins >= 1) {
                foodItem.style.display = 'none'; // Temporarily hide food
                frogMouth.classList.add('chewing'); // Add chewing animation class
                playSound(eatingSound);
                feedFrog();

                setTimeout(() => {
                    frogMouth.classList.remove('chewing'); // Remove chewing animation
                    foodItem.style.display = 'block'; // Make food visible again (for next drag)
                    // Reset food item position
                    foodItem.style.position = 'absolute';
                    foodItem.style.left = '50%';
                    foodItem.style.top = '';
                    foodItem.style.transform = 'translateX(-50%)';
                }, 2000); // Chewing for 2 seconds
            } else {
                alert(translations[currentLanguage].notEnoughCoins);
                foodItem.style.position = 'absolute';
                foodItem.style.left = '50%';
                foodItem.style.top = ''; // Remove top to let bottom take over
                foodItem.style.transform = 'translateX(-50%)';
            }
        } else {
            // Reset position if not dropped in mouth
            foodItem.style.position = 'absolute';
            foodItem.style.left = '50%';
            foodItem.style.top = ''; // Remove top to let bottom take over
            foodItem.style.transform = 'translateX(-50%)';
        }
    });

    function isNearMouth(food, mouth) {
        const foodRect = food.getBoundingClientRect();
        const mouthRect = mouth.getBoundingClientRect();

        // Check for overlap or close proximity
        const overlapThreshold = 20; // Pixels

        return (
            foodRect.left < mouthRect.right + overlapThreshold &&
            foodRect.right > mouthRect.left - overlapThreshold &&
            foodRect.top < mouthRect.bottom + overlapThreshold &&
            foodRect.bottom > mouthRect.top - overlapThreshold
        );
    }

    // Functions to interact with the frog
    function feedFrog() {
        coins -= 1;
        fullness = Math.min(100, fullness + 20); // Increase fullness
        happiness = Math.min(100, happiness + 10); // Increase happiness
        updateStatsDisplay();
        updateCoinDisplay();
    }

    function washFrog() {
        cleanliness = Math.min(100, cleanliness + 30); // Increase cleanliness
        happiness = Math.min(100, happiness + 5); // Increase happiness
        updateStatsDisplay();
    }

    function playMinigame() {
        happiness = Math.min(100, happiness + 25); // Increase happiness
        fullness = Math.max(0, fullness - 10); // Decrease fullness (from activity)
        cleanliness = Math.max(0, cleanliness - 5); // Slightly decrease cleanliness
        updateStatsDisplay();
    }

    function sleepFrog() {
        sleep = Math.min(100, sleep + 40); // Increase sleep significantly
        happiness = Math.min(100, happiness + 15); // Increase happiness
        fullness = Math.max(0, fullness - 5); // Slightly decrease fullness (from resting)
        updateStatsDisplay();
    }

    // Add event listeners to action buttons
    washButton.addEventListener('click', washFrog);
    playMinigameButton.addEventListener('click', playMinigame);
    sleepButton.addEventListener('click', sleepFrog);

    workButton.addEventListener('click', () => {
        coins += 10; // Earn 10 coins per work action
        updateCoinDisplay();
        happiness = Math.max(0, happiness - 5); // Working might decrease happiness slightly
        sleep = Math.max(0, sleep - 50); // Working makes frog more sleepy
        updateStatsDisplay();
    });

    windowItem.addEventListener('click', () => {
        oxygen = Math.min(100, oxygen + 15); // Increase oxygen
        temperature = Math.max(-10, temperature - 5); // Decrease temperature, but not below -10
        updateStatsDisplay();
    });

    furnaceItem.addEventListener('click', () => {
        if (coins >= 1) {
            coins -= 1;
            temperature = Math.min(40, temperature + 1); // Increase temperature, but not above 40
            updateStatsDisplay();
            updateCoinDisplay();
        } else {
            alert(translations[currentLanguage].notEnoughCoins); // Alert if not enough coins
        }
    });

    startGameButton.addEventListener('click', () => {
        difficultySelectionScreen.classList.add('hidden');
        tutorialScreen.classList.remove('hidden'); // Show tutorial screen
    });

    closeTutorialButton.addEventListener('click', () => {
        primeAudio();
        tutorialScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        // Show interactive elements and vertical stats
        interactiveElementsContainer.classList.remove('hidden');
        verticalStatsContainer.classList.remove('hidden');
        coinDisplay.classList.remove('hidden'); // Show coin display
        levelDisplay.classList.remove('hidden'); // Show level display
        updateCoinDisplay(); // Update coin display with initial value
        startEyeMovement(); // Start the alternating eye movement

        // Set difficulty multiplier based on selection
        const selectedDifficulty = difficultySelect.value;
        switch (selectedDifficulty) {
            case 'peaceful':
                difficultyMultiplier = 0.5;
                break;
            case 'easy':
                difficultyMultiplier = 1;
                break;
            case 'medium':
                difficultyMultiplier = 1.5;
                break;
            case 'hard':
                difficultyMultiplier = 2;
                break;
            case 'hardcore':
                difficultyMultiplier = 3;
                break;
            default:
                difficultyMultiplier = 1; // Default to easy
        }

        // Periodic stat decline
        gameInterval = setInterval(() => {
            fullness = Math.max(0, fullness - (2 * difficultyMultiplier)); // Fullness declines slowly
            let cleanlinessDecline = 3;
            if (poopPresent) {
                cleanlinessDecline = 15; // 5 times faster decline if poop is present
            }
            cleanliness = Math.max(0, cleanliness - (cleanlinessDecline * difficultyMultiplier)); // Cleanliness declines a bit faster
            happiness = Math.max(0, happiness - (1 * difficultyMultiplier)); // Happiness declines slowly
            sleep = Math.max(0, sleep - (2 * difficultyMultiplier)); // Sleep declines at a moderate rate
            oxygen = Math.max(0, oxygen - (5 * difficultyMultiplier)); // Oxygen declines at 1% per second (5% every 5 seconds)
            // Temperature will fluctuate, for now a slight drift
            temperature = temperature - (0.5 * difficultyMultiplier);
            // Ensure temperature stays within a reasonable range, e.g., -10 to 40 for now
            temperature = Math.max(-10, Math.min(40, temperature));
            updateStatsDisplay();
            checkGameOver();
        }, 5000); // Every 5 seconds

        // Level up every 60 seconds
        levelInterval = setInterval(() => {
            timeToNextLevelCounter--;
            timeToNextLevelAmountElement.textContent = timeToNextLevelCounter;

            if (timeToNextLevelCounter <= 0) {
                if (level < 5) {
                    level++;
                    timeToNextLevelCounter = 60; // Reset counter
                    updateLevelDisplay();
                    checkWinCondition();
                } else {
                    clearInterval(levelInterval); // Stop level interval if max level reached
                }
            }
        }, 1000); // Update every second
    });

    function checkGameOver() {
        let deathReason = "";
        if (fullness <= 0) {
            deathReason = translations[currentLanguage].deathStarved;
        } else if (cleanliness <= 0) {
            deathReason = translations[currentLanguage].deathFilth;
        } else if (happiness <= 0) {
            deathReason = translations[currentLanguage].deathSadness;
        } else if (sleep <= 0) {
            deathReason = translations[currentLanguage].deathTired;
        } else if (oxygen <= 0) {
            deathReason = translations[currentLanguage].deathOxygen;
        } else if (temperature <= -10) {
            deathReason = translations[currentLanguage].deathFrozen;
        } else if (temperature >= 35) {
            deathReason = translations[currentLanguage].deathOverheated;
        }

        if (deathReason !== "") {
            triggerGameOver(deathReason);
        }
    }

    function checkWinCondition() {
        if (level >= 5) {
            clearInterval(gameInterval);
            clearInterval(poopSpawnInterval);
            clearInterval(levelInterval);
            clearTimeout(specialLossTimeout);
            specialLossTimeout = null;
            gameScreen.classList.add('hidden');
            winScreen.classList.remove('hidden'); // Assuming winScreen exists
        }
    }

    function disableGameInteractions() {
        // Disable room navigation buttons
        goToKitchenButton.disabled = true;
        goToBathroomButton.disabled = true;
        goToBedroomButton.disabled = true;
        goToPlayroomButton.disabled = true;
        goToJobButton.disabled = true;

        // Disable action buttons
        washButton.disabled = true;
        playMinigameButton.disabled = true;
        sleepButton.disabled = true;
        workButton.disabled = true;

        // Disable food item dragging
        foodItem.draggable = false;
        foodItem.style.cursor = 'default';

        // Disable poop item clicking
        poopItem.style.pointerEvents = 'none';
        frogContainer.style.pointerEvents = 'none';
        windowItem.style.pointerEvents = 'none';
        furnaceItem.style.pointerEvents = 'none';
    }

    goToKitchenButton.addEventListener('click', () => showRoom(kitchenRoom));
    goToBathroomButton.addEventListener('click', () => showRoom(bathroomRoom));
    goToBedroomButton.addEventListener('click', () => showRoom(bedroomRoom));
    goToPlayroomButton.addEventListener('click', () => showRoom(playroomRoom));
    goToJobButton.addEventListener('click', () => showRoom(jobRoom));

    // Eye movement logic
    function movePupil(eye, pupil, targetX, targetY) {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const angle = Math.atan2(targetY - eyeCenterY, targetX - eyeCenterX);
        const distance = Math.min(eyeRect.width / 4, Math.hypot(targetX - eyeCenterX, targetY - eyeCenterY));

        const pupilX = distance * Math.cos(angle);
        const pupilY = distance * Math.sin(angle);

        pupil.style.transform = `translate(-50%, -50%) translate(${pupilX}px, ${pupilY}px)`;
    }

    let isLookingAtCursor = true;
    let eyeMovementInterval;

    function getRandomTime() {
        return Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // 2 to 5 seconds
    }

    function startEyeMovement() {
        clearInterval(eyeMovementInterval); // Clear any existing interval

        const frogContainer = document.getElementById('frog-container');
        const frogRect = frogContainer.getBoundingClientRect();
        const playerTargetX = frogRect.left + frogRect.width / 2;
        const playerTargetY = frogRect.top + frogRect.height / 2;

        function alternateLook() {
            if (isLookingAtCursor) {
                // Look at cursor (handled by mousemove event)
                gameScreen.addEventListener('mousemove', handleMouseMove);
                gameScreen.removeEventListener('mousemove', handlePlayerLook); // Ensure player look is off
            } else {
                // Look at player (fixed point)
                gameScreen.removeEventListener('mousemove', handleMouseMove); // Stop following cursor
                handlePlayerLook(); // Immediately look at player
                gameScreen.addEventListener('mousemove', handlePlayerLook); // Keep looking at player even if mouse moves
            }
            isLookingAtCursor = !isLookingAtCursor;
            eyeMovementInterval = setTimeout(alternateLook, getRandomTime());
        }

        function handleMouseMove(e) {
            movePupil(eyeLeft, pupilLeft, e.clientX, e.clientY);
            movePupil(eyeRight, pupilRight, e.clientX, e.clientY);
        }

        function handlePlayerLook() {
            // To center the pupils, we need to pass the center of each eye as the target coordinates.
            const eyeLeftRect = eyeLeft.getBoundingClientRect();
            const eyeLeftCenterX = eyeLeftRect.left + eyeLeftRect.width / 2;
            const eyeLeftCenterY = eyeLeftRect.top + eyeLeftRect.height / 2;

            const eyeRightRect = eyeRight.getBoundingClientRect();
            const eyeRightCenterX = eyeRightRect.left + eyeRightRect.width / 2;
            const eyeRightCenterY = eyeRightRect.top + eyeRightRect.height / 2;

            movePupil(eyeLeft, pupilLeft, eyeLeftCenterX, eyeLeftCenterY);
            movePupil(eyeRight, pupilRight, eyeRightCenterX, eyeRightCenterY);
        }

        // Initial call
        alternateLook();
    }


});
