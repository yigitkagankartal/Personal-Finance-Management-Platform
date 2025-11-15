import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const API_BASE = "http://localhost:8080/api";


function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "",
    type: "INCOME",
    amount: "",
  });

  // Backend'den veri çek
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Veriler alınırken hata:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Özetleri hesapla
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const savingRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Kategoriye göre gider dağılımı (grafik için)
  const expenseByCategoryMap = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expenseChartData = Object.entries(expenseByCategoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const CHART_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#e11d48", "#a855f7"];

  // Kategoriye göre GELİR dağılımı
  const incomeByCategoryMap = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const incomeChartData = Object.entries(incomeByCategoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );


  // Form değişimi
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "amount" ? Number(value) : value,
    }));
  };

  // Yeni işlem ekleme
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const created = await res.json();

      setTransactions((prev) => [...prev, created]);

      // Formu temizle
      setForm({
        date: "",
        description: "",
        category: "",
        type: "INCOME",
        amount: "",
      });

      setActiveSection("dashboard");
    } catch (err) {
      console.error("İşlem eklenirken hata:", err);
    }
  };

  // Silme işlemi
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Silme sırasında hata:", err);
    }
  };

  // Son 5 işlem
  const recentTransactions = [...transactions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Kişisel Finans</h2>

        <nav>
          <button
            className={`nav-btn ${activeSection === "dashboard" ? "active" : ""
              }`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-btn ${activeSection === "transactions" ? "active" : ""
              }`}
            onClick={() => setActiveSection("transactions")}
          >
            İşlemler
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        {/* DASHBOARD SECTION */}
        <section
          id="dashboard"
          className={`section ${activeSection === "dashboard" ? "active" : ""}`}
        >
          <header>
            <h1>Hoş geldin Yiğit 👋</h1>
            <p>Bugünkü finansal özetin</p>
          </header>

          {/* KARTLAR */}
          <div className="cards">
            <div className="card">
              <span className="card-label">Toplam Bakiye</span>
              <span className="card-value">
                {balance.toLocaleString("tr-TR")} ₺
              </span>
            </div>

            <div className="card">
              <span className="card-label">Toplam Gelir</span>
              <span className="card-value income">
                {totalIncome.toLocaleString("tr-TR")} ₺
              </span>
            </div>

            <div className="card">
              <span className="card-label">Toplam Gider</span>
              <span className="card-value expense">
                {totalExpense.toLocaleString("tr-TR")} ₺
              </span>
            </div>

            <div className="card">
              <span className="card-label">Tasarruf Oranı</span>
              <span className="card-value">{savingRate}%</span>
            </div>
          </div>

          {/* GİDER GRAFİĞİ */}
          <section className="recent">
            <h2>Kategoriye Göre Gider Dağılımı</h2>
            {expenseChartData.length === 0 ? (
              <p>Gider verisi bulunmuyor.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* GELİR GRAFİĞİ */}
          <section className="recent">
            <h2>Kategoriye Göre Gelir Dağılımı</h2>
            {incomeChartData.length === 0 ? (
              <p>Gelir verisi bulunmuyor.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-income-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>


          {/* SON İŞLEMLER */}
          <section className="recent">
            <h2>Son İşlemler</h2>

            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                  <th>Kategori</th>
                  <th>Tür</th>
                  <th>Tutar</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>{t.type === "INCOME" ? "Gelir" : "Gider"}</td>
                      <td>{t.amount.toLocaleString("tr-TR")} ₺</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">Son işlem bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>

        {/* TRANSACTIONS SECTION */}
        <section
          id="transactions"
          className={`section ${activeSection === "transactions" ? "active" : ""
            }`}
        >
          <header>
            <h1>İşlemler</h1>
            <p>Gelir ve giderlerini buradan yönet</p>
          </header>

          {/* FORM */}
          <div className="form-card">
            <h2>Yeni İşlem Ekle</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="date">Tarih</label>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="description">Açıklama</label>
                <input
                  type="text"
                  id="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="category">Kategori</label>
                <input
                  type="text"
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="type">Tür</label>
                <select
                  id="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="INCOME">Gelir</option>
                  <option value="EXPENSE">Gider</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="amount">Tutar (₺)</label>
                <input
                  type="number"
                  id="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">
                Kaydet
              </button>
            </form>
          </div>

          {/* TÜM İŞLEMLER */}
          <section className="transactions-table">
            <h2>Tüm İşlemler</h2>

            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                  <th>Kategori</th>
                  <th>Tür</th>
                  <th>Tutar</th>
                  <th>Sil</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>{t.type === "INCOME" ? "Gelir" : "Gider"}</td>
                      <td>{t.amount.toLocaleString("tr-TR")} ₺</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(t.id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">Henüz işlem bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
