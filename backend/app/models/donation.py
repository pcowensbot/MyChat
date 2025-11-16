"""
Donation system models
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Index, Text, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class NodeDonationSettings(Base):
    """Node donation settings"""
    __tablename__ = "node_donation_settings"

    id = Column(Integer, primary_key=True)
    enabled = Column(Boolean, default=False)
    custom_message = Column(Text, nullable=True)
    monthly_goal = Column(DECIMAL(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<NodeDonationSettings enabled={self.enabled}>"


class DonationWallet(Base):
    """Crypto wallet addresses"""
    __tablename__ = "donation_wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_type = Column(String(50), nullable=False)  # bitcoin, ethereum, monero, etc.
    wallet_address = Column(Text, nullable=False)
    label = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_display_order', 'display_order'),
    )

    def __repr__(self):
        return f"<DonationWallet {self.wallet_type}>"


class DonationLink(Base):
    """External donation links (Patreon, Ko-fi, etc.)"""
    __tablename__ = "donation_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform = Column(String(50), nullable=False)  # patreon, kofi, github_sponsors, etc.
    url = Column(Text, nullable=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_display_order', 'display_order'),
    )

    def __repr__(self):
        return f"<DonationLink {self.platform}>"


class DonationAnalytics(Base):
    """Anonymous donation analytics (no PII)"""
    __tablename__ = "donation_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(50), nullable=False)  # page_view, wallet_copied, link_clicked
    wallet_type = Column(String(50), nullable=True)
    platform = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_timestamp', 'timestamp'),
    )

    def __repr__(self):
        return f"<DonationAnalytics {self.event_type}>"
