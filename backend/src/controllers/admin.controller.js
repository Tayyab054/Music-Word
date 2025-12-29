import memoryStore from "../store/memoryStore.js";
import db from "../config/db.config.js";
import bcrypt from "bcrypt";

/* ========================= DASHBOARD STATS ========================= */

export function getDashboardStats(req, res) {
  try {
    const stats = {
      totalSongs: memoryStore.songs.getSize(),
      totalArtists: memoryStore.artists.getSize(),
      totalUsers: memoryStore.users.getSize(),
      totalCategories: memoryStore.categories.getSize(),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ========================= SONG MANAGEMENT ========================= */

// Add new song
export async function addSong(req, res) {
  try {
    const { title, image_url, song_url, artist_id } = req.body;

    if (!title || !song_url || !artist_id) {
      return res.status(400).json({
        success: false,
        message: "Title, song URL, and artist are required",
      });
    }

    // Verify artist exists
    const artist = memoryStore.getArtist(artist_id);
    if (!artist) {
      return res.status(400).json({
        success: false,
        message: "Artist not found",
      });
    }

    const song = await memoryStore.addSong({
      title,
      image_url,
      song_url,
      artist_id,
    });

    res.status(201).json({
      success: true,
      message: "Song added successfully",
      song,
    });
  } catch (error) {
    console.error("Add song error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Update song
export async function updateSong(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const song = await memoryStore.updateSong(id, updates);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.json({
      success: true,
      message: "Song updated successfully",
      song,
    });
  } catch (error) {
    console.error("Update song error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete song
export async function deleteSong(req, res) {
  try {
    const { id } = req.params;

    const song = await memoryStore.deleteSong(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    res.json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Delete song error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ========================= ARTIST MANAGEMENT ========================= */

// Add new artist
export async function addArtist(req, res) {
  try {
    const { artist_name, category, image_url } = req.body;

    if (!artist_name) {
      return res.status(400).json({
        success: false,
        message: "Artist name is required",
      });
    }

    const artist = await memoryStore.addArtist({
      artist_name,
      category,
      image_url,
    });

    res.status(201).json({
      success: true,
      message: "Artist added successfully",
      artist,
    });
  } catch (error) {
    console.error("Add artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Update artist
export async function updateArtist(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const artist = await memoryStore.updateArtist(id, updates);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    res.json({
      success: true,
      message: "Artist updated successfully",
      artist,
    });
  } catch (error) {
    console.error("Update artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete artist
export async function deleteArtist(req, res) {
  try {
    const { id } = req.params;

    const artist = await memoryStore.deleteArtist(id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    res.json({
      success: true,
      message: "Artist and all their songs deleted successfully",
    });
  } catch (error) {
    console.error("Delete artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ========================= USER MANAGEMENT ========================= */

// Get all users
export function getAllUsers(req, res) {
  try {
    const users = memoryStore.getAllUsers();
    res.json({
      success: true,
      users: users.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
      count: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get user by ID
export function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = memoryStore.getUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Update user role
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    await db.query("UPDATE users SET role = $1 WHERE user_id = $2", [role, id]);

    memoryStore.updateUser(id, { role });

    res.json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (Number(id) === req.session.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await memoryStore.deleteUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Create admin user
export async function createAdmin(req, res) {
  try {
    const { email, password, name } = req.body;

    // Check email
    const emailCheck = await db.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const { rows } = await db.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, 'admin') 
       RETURNING user_id, name, email, role`,
      [email, hashedPassword, name]
    );

    const user = rows[0];
    memoryStore.addUser(user);

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
