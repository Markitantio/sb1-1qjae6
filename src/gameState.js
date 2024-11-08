export class GameState {
  constructor() {
    this.inventory = [];
    this.quests = [];
    this.enemies = [];
    this.skills = {
      swordsmanship: 1,
      darkMagic: 1,
      necromancy: 1
    };
    
    // Initialize with dark fantasy starter items
    this.addToInventory({
      name: "Cursed Blade",
      type: "weapon",
      damage: 8,
      curse: "Drains 1 HP per hit",
      description: "A blade that thirsts for the blood of both enemies and its wielder"
    });
    
    this.addToInventory({
      name: "Soul Essence",
      type: "consumable",
      manaRestore: 30,
      description: "The captured essence of a fallen warrior"
    });

    // Add starting quest
    this.addQuest({
      id: "dark_ritual",
      title: "The Dark Ritual",
      description: "Find the ancient altar in the cursed woods",
      objectives: ["Find the altar", "Collect 3 dark crystals", "Perform the ritual"],
      status: "active",
      rewards: {
        experience: 100,
        items: ["Necromancer's Robe"],
        skills: { necromancy: 1 }
      }
    });

    // Toggle inventory visibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') {
        const inv = document.getElementById('inventory');
        inv.style.display = inv.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  addToInventory(item) {
    this.inventory.push(item);
    this.updateInventoryUI();
  }

  removeFromInventory(itemIndex) {
    this.inventory.splice(itemIndex, 1);
    this.updateInventoryUI();
  }

  updateInventoryUI() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '<h3>Grimoire & Possessions</h3>';
    this.inventory.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';
      itemDiv.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-type">${item.type}</span>
        ${item.description ? `<p class="item-desc">${item.description}</p>` : ''}
      `;
      inventoryDiv.appendChild(itemDiv);
    });
  }

  addQuest(quest) {
    this.quests.push(quest);
    this.updateQuestLog();
  }

  updateQuestLog() {
    // Update quest UI here
    console.log("Quest added:", this.quests[this.quests.length - 1].title);
  }

  update() {
    this.updateEnemies();
    this.checkQuestProgress();
    this.updateEnvironmentalEffects();
  }

  updateEnemies() {
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        // Basic AI behavior
        if (enemy.type === 'undead') {
          // Undead enemies are more aggressive at night
          enemy.aggressionLevel = this.isNightTime() ? 2 : 1;
        }
      }
    });
  }

  checkQuestProgress() {
    this.quests.forEach(quest => {
      if (quest.status === 'active') {
        const completed = quest.objectives.every(obj => obj.completed);
        if (completed) {
          this.completeQuest(quest.id);
        }
      }
    });
  }

  completeQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && quest.status === 'active') {
      quest.status = 'completed';
      this.grantQuestRewards(quest.rewards);
    }
  }

  grantQuestRewards({ experience, items, skills }) {
    this.stats.experience += experience;
    items?.forEach(item => this.addToInventory(item));
    if (skills) {
      Object.entries(skills).forEach(([skill, level]) => {
        this.skills[skill] += level;
      });
    }
  }

  isNightTime() {
    // Simple day/night cycle check
    return Math.sin(Date.now() / 10000) < 0;
  }

  updateEnvironmentalEffects() {
    // Add environmental effects based on time and location
    const isNight = this.isNightTime();
    if (isNight) {
      // Increase spawn rate of undead
      if (Math.random() < 0.05) {
        this.spawnUndead();
      }
    }
  }

  spawnUndead() {
    const undead = {
      type: 'undead',
      name: 'Risen Warrior',
      health: 50,
      damage: 10,
      active: true,
      position: {
        x: Math.random() * 80 - 40,
        y: 0,
        z: Math.random() * 80 - 40
      }
    };
    this.enemies.push(undead);
  }
}