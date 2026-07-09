// src/pages/admin/SendNotificationPage.jsx - ENHANCED VERSION
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Chip,
  Spinner,
  Alert,
  Select,
  Option,
} from "@material-tailwind/react";
import { Send, Users, Package, Store, Search } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "@/utils/Loader";
import { userService } from "@/api/services/user.service";
import { NotificationService } from "@/api/services/notifications.service";
import { productService } from "@/api/services/product.service";
import { storeService } from "@/api/services/stores.service";
import TablePagination from "@/widgets/components/tablePagination";

const SendNotification = () => {
  // ── Form State ──────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  // ── Link Type & Selection ──────────────────────────────────
  const [linkType, setLinkType] = useState("none"); // none, product, store
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  
  // ── Data Lists ──────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ── User Selection ──────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // ── Loading States ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // ── Pagination ──────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [total, setTotal] = useState(0);

  // ── Fetch Users ─────────────────────────────────────────────
  const fetchUsers = async (p = 1) => {
    setFetching(true);
    try {
      const res = await userService.list(p, {});
      const data = res.data?.data;

      const mapped = (data.users || []).map((u, i) => ({
        _id: u._id,
        id: (data.currentPage - 1) * 10 + i + 1,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
      }));

      setUsers(mapped);
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
      setHasNext(data.hasNextPage);
      setHasPrev(data.hasPrevPage);
      setTotal(data.totalData);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setFetching(false);
    }
  };

  // ── Fetch Products (Active Only) ────────────────────────────
  const fetchProducts = async () => {
    setLoadingData(true);
    try {
      const res = await productService.list({ status: "active", limit: 100 });
      console.log("this is product List", res.data.data);
      
      const data = res.data?.data?.products || [];
      setProducts(data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoadingData(false);
    }
  };

  // ── Fetch Stores (Active Only) ──────────────────────────────
  const fetchStores = async () => {
    setLoadingData(true);
    try {
      const res = await storeService.list(1, { status: "active", limit: 100 });
      console.log("this is stores", res.data.data);
      
      const data = res.data?.data?.storeData || [];
      setStores(data);
    } catch (err) {
      toast.error("Failed to load stores");
    } finally {
      setLoadingData(false);
    }
  };

  // ── Initial Load ────────────────────────────────────────────
  useEffect(() => {
    fetchUsers(1);
    fetchProducts();
    fetchStores();
  }, []);

  // ── Select All Logic ────────────────────────────────────────
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(users.map(u => u._id));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, users]);

  const toggleUser = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ── Image Handling ──────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, WebP allowed");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Image must be < 1 MB");
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Build Notification Data ─────────────────────────────────
  const buildNotificationData = () => {
    const data = {};
    
    switch (linkType) {
      case "product":
        if (selectedProductId) {
          data.productId = selectedProductId;
          data.type = "product";
        }
        break;
      case "store":
        if (selectedStoreId) {
          data.storeId = selectedStoreId;
          data.type = "store";
        }
        break;
      default:
        data.type = "general";
    }
    
    return data;
  };

  // ── Submit Notification ─────────────────────────────────────
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title & body required");
      return;
    }

    // Validation for link type
    if (linkType === "product" && !selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    if (linkType === "store" && !selectedStoreId) {
      toast.error("Please select a store");
      return;
    }

    setLoading(true);
    try {
      const notificationData = buildNotificationData();
      
      await NotificationService.send({
        title,
        body,
        image,
        data: notificationData,
        userIds: selectedIds.length ? selectedIds : null,
      });

      toast.success(
        `Notification sent to ${selectedIds.length || "all"} user(s)!`
      );

      // Reset form
      setTitle("");
      setBody("");
      setImage(null);
      setPreviewUrl("");
      setLinkType("none");
      setSelectedProductId("");
      setSelectedStoreId("");
      setSelectedIds([]);
      setSelectAll(false);
      setSearchTerm("");
      document.getElementById("image-input").value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Send failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Filter Items by Search ──────────────────────────────────
  const filterItems = (items, searchField = "name") => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => 
      item[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // ── Pagination ──────────────────────────────────────────────
  const goPage = (p) => {
    setPage(p);
    fetchUsers(p);
  };

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-8">
      {/* ── Header ── */}
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h5" color="white">
                Send Push Notification
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Broadcast or target specific users with deep links
              </Typography>
            </div>
            <Button
              color="white"
              variant="outlined"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => fetchUsers(page)}
            >
              <Users size={16} /> Refresh Users
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Form Card ── */}
      <Card>
        <CardBody className="grid md:grid-cols-2 gap-6">
          {/* Left – Form */}
          <div className="space-y-5">
            <div>
              <Typography className="mb-1 font-medium">Title *</Typography>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Flash Sale Alert!"
                className="w-full"
              />
            </div>

            <div>
              <Typography className="mb-1 font-medium">Message *</Typography>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Get 50% off on electronics..."
                rows={4}
              />
            </div>

            <div>
              <Typography className="mb-1 font-medium">Image (optional)</Typography>
              <Input
                id="image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImage}
                className="w-full"
              />
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Link Type Selection */}
            <div>
              <Typography className="mb-2 font-medium">Link Type</Typography>
              <Select
                value={linkType}
                onChange={(val) => {
                  setLinkType(val);
                  setSelectedProductId("");
                  setSelectedStoreId("");
                  setSearchTerm("");
                }}
                label="Select link type"
              >
                <Option value="none">No Link</Option>
                <Option value="product">Product Link</Option>
                <Option value="store">Store Link</Option>
              </Select>
            </div>

            {/* Dynamic Content Based on Link Type */}
            {linkType !== "none" && (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${linkType}...`}
                    className="pl-10"
                  />
                </div>

                {/* Product Selection */}
                {linkType === "product" && (
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {loadingData ? (
                      <div className="text-center py-4"><Spinner /></div>
                    ) : filterItems(products).length === 0 ? (
                      <Typography className="text-center text-gray-500">
                        No active products found
                      </Typography>
                    ) : (
                      <div className="space-y-2">
                        {filterItems(products).map((product) => (
                          <div
                            key={product._id}
                            onClick={() => setSelectedProductId(product._id)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all ${
                              selectedProductId === product._id
                                ? "bg-blue-50 border-blue-500"
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {product.logo && (
                                <img
                                  src={product.logo}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <Typography className="font-medium">
                                  {product.name}
                                </Typography>
                                <Typography className="text-sm text-gray-600">
                                  {product.brand.name} • ₹{product.sellingPrice}
                                </Typography>
                              </div>
                              <Package size={18} className="text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Store Selection */}
                {linkType === "store" && (
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {loadingData ? (
                      <div className="text-center py-4"><Spinner /></div>
                    ) : filterItems(stores).length === 0 ? (
                      <Typography className="text-center text-gray-500">
                        No active stores found
                      </Typography>
                    ) : (
                      <div className="space-y-2">
                        {filterItems(stores).map((store) => (
                          <div
                            key={store._id}
                            onClick={() => setSelectedStoreId(store._id)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all ${
                              selectedStoreId === store._id
                                ? "bg-blue-50 border-blue-500"
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {store.image && (
                                <img
                                  src={store.image}
                                  alt={store.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <Typography className="font-medium">
                                  {store.name}
                                </Typography>
                                <Typography className="text-sm text-gray-600">
                                  Rating: {store.rating} • Earn: {store.earn}
                                </Typography>
                              </div>
                              <Store size={18} className="text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              fullWidth
              color="blue"
              className="flex items-center justify-center gap-2"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : <Send size={18} />}
              {loading ? "Sending..." : "Send Notification"}
            </Button>
          </div>

          {/* Right – Preview & Stats */}
          <div className="flex flex-col gap-4">
            <Alert color="blue" icon={<Users />}>
              <Typography className="font-medium">
                {selectedIds.length
                  ? `${selectedIds.length} user(s) selected`
                  : "Broadcast to all users"}
              </Typography>
            </Alert>

            {/* Link Preview */}
            {linkType !== "none" && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <Typography className="font-semibold mb-2 text-blue-900">
                  Deep Link Preview
                </Typography>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip
                      value={linkType}
                      color={linkType === "product" ? "green" : "purple"}
                      size="sm"
                    />
                    <Typography className="text-sm text-gray-700">
                      {(() => {
                        if (linkType === "product") {
                          if (selectedProductId) {
                            const product = products.find(p => p._id === selectedProductId);
                            return product?.name || "Selected Product";
                          }
                          return "No product selected";
                        }
                        if (linkType === "store") {
                          if (selectedStoreId) {
                            const store = stores.find(s => s._id === selectedStoreId);
                            return store?.name || "Selected Store";
                          }
                          return "No store selected";
                        }
                        return "";
                      })()}
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <Typography className="text-sm text-amber-900">
                <strong>Note:</strong> Users will be redirected to the linked content when they tap the notification.
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Users Table ── */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <Typography variant="h6" color="white">
            Select Recipients
          </Typography>
        </CardHeader>
        <CardBody className="p-0">
          {fetching ? (
            <div className="p-12 text-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => setSelectAll(e.target.checked)}
                          className="rounded"
                        />
                      </th>
                      {["#", "Name", "Email", "Role", "Status"].map((h) => (
                        <th
                          key={h}
                          className="border-b border-blue-gray-50 py-3 px-4 text-left"
                        >
                          <Typography
                            variant="small"
                            className="font-bold uppercase text-blue-gray-900"
                          >
                            {h}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSel = selectedIds.includes(u._id);
                      return (
                        <tr
                          key={u._id}
                          className={`hover:bg-gray-50 ${isSel ? "bg-blue-50" : ""}`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => toggleUser(u._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-4">{u.id}</td>
                          <td className="p-4">
                            <Typography className="font-medium">
                              {u.fullName}
                            </Typography>
                          </td>
                          <td className="p-4 text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <Chip
                              variant="gradient"
                              color={
                                u.role === "admin"
                                  ? "purple"
                                  : u.role === "manager"
                                  ? "blue"
                                  : "orange"
                              }
                              value={u.role}
                              className="py-1 px-2 text-xs w-fit"
                            />
                          </td>
                          <td className="p-4">
                            <Chip
                              variant="gradient"
                              color={u.status === "active" ? "green" : "red"}
                              value={u.status}
                              className="py-1 px-2 text-xs w-fit"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No users found
                </div>
              )}

              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                hasNextPage={hasNext}
                hasPrevPage={hasPrev}
                onNextPage={() => goPage(page + 1)}
                onPrevPage={() => goPage(page - 1)}
                onPageChange={goPage}
                totalItems={total}
                itemsPerPage={10}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SendNotification;